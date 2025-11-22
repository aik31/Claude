import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all bookings for the authenticated user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { customerId: req.user!.userId },
      include: {
        boat: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get bookings for boats owned by the authenticated user
router.get('/owner', authenticate, async (req: AuthRequest, res) => {
  try {
    const boats = await prisma.boat.findMany({
      where: { ownerId: req.user!.userId },
      select: { id: true },
    });

    const boatIds = boats.map((boat) => boat.id);

    const bookings = await prisma.booking.findMany({
      where: {
        boatId: { in: boatIds },
      },
      include: {
        boat: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create a new booking
router.post(
  '/',
  authenticate,
  [
    body('boatId').isUUID(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
  ],
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { boatId, startDate, endDate } = req.body;

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return res
          .status(400)
          .json({ error: 'End date must be after start date' });
      }

      const boat = await prisma.boat.findUnique({
        where: { id: boatId },
      });

      if (!boat) {
        return res.status(404).json({ error: 'Boat not found' });
      }

      if (!boat.available) {
        return res.status(400).json({ error: 'Boat is not available' });
      }

      // Check for overlapping bookings
      const overlappingBookings = await prisma.booking.findMany({
        where: {
          boatId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          OR: [
            {
              startDate: { lte: end },
              endDate: { gte: start },
            },
          ],
        },
      });

      if (overlappingBookings.length > 0) {
        return res
          .status(400)
          .json({ error: 'Boat is already booked for these dates' });
      }

      const days = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalPrice = Number(boat.pricePerDay) * days;

      const booking = await prisma.booking.create({
        data: {
          boatId,
          customerId: req.user!.userId,
          startDate: start,
          endDate: end,
          totalPrice,
          status: 'PENDING',
        },
        include: {
          boat: {
            include: {
              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      res.status(201).json(booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  }
);

// Update booking status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res) => {
  const { status } = req.body;

  if (!['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { boat: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (
      booking.customerId !== req.user!.userId &&
      booking.boat.ownerId !== req.user!.userId
    ) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        boat: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

export default router;
