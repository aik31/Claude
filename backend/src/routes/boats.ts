import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all boats with optional filters
router.get('/', async (req, res) => {
  try {
    const { type, location, minPrice, maxPrice, capacity } = req.query;

    const where: any = { available: true };

    if (type) {
      where.type = type;
    }

    if (location) {
      where.location = {
        contains: location as string,
        mode: 'insensitive',
      };
    }

    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) where.pricePerDay.gte = Number(minPrice);
      if (maxPrice) where.pricePerDay.lte = Number(maxPrice);
    }

    if (capacity) {
      where.capacity = { gte: Number(capacity) };
    }

    const boats = await prisma.boat.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const boatsWithRating = boats.map((boat) => {
      const avgRating =
        boat.reviews.length > 0
          ? boat.reviews.reduce((sum, r) => sum + r.rating, 0) /
            boat.reviews.length
          : 0;

      return {
        ...boat,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: boat.reviews.length,
      };
    });

    res.json(boatsWithRating);
  } catch (error) {
    console.error('Error fetching boats:', error);
    res.status(500).json({ error: 'Failed to fetch boats' });
  }
});

// Get boat by ID
router.get('/:id', async (req, res) => {
  try {
    const boat = await prisma.boat.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!boat) {
      return res.status(404).json({ error: 'Boat not found' });
    }

    const avgRating =
      boat.reviews.length > 0
        ? boat.reviews.reduce((sum, r) => sum + r.rating, 0) /
          boat.reviews.length
        : 0;

    res.json({
      ...boat,
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: boat.reviews.length,
    });
  } catch (error) {
    console.error('Error fetching boat:', error);
    res.status(500).json({ error: 'Failed to fetch boat' });
  }
});

// Create a new boat (authenticated owners only)
router.post(
  '/',
  authenticate,
  [
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('type').isIn([
      'SAILBOAT',
      'MOTORBOAT',
      'YACHT',
      'CATAMARAN',
      'PONTOON',
      'FISHING',
      'SPEEDBOAT',
      'OTHER',
    ]),
    body('capacity').isInt({ min: 1 }),
    body('pricePerDay').isFloat({ min: 0 }),
    body('location').trim().notEmpty(),
  ],
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      type,
      capacity,
      pricePerDay,
      location,
      latitude,
      longitude,
      imageUrl,
    } = req.body;

    try {
      const boat = await prisma.boat.create({
        data: {
          name,
          description,
          type,
          capacity,
          pricePerDay,
          location,
          latitude,
          longitude,
          imageUrl,
          ownerId: req.user!.userId,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json(boat);
    } catch (error) {
      console.error('Error creating boat:', error);
      res.status(500).json({ error: 'Failed to create boat' });
    }
  }
);

// Update boat (owner only)
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const boat = await prisma.boat.findUnique({
      where: { id: req.params.id },
    });

    if (!boat) {
      return res.status(404).json({ error: 'Boat not found' });
    }

    if (boat.ownerId !== req.user!.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedBoat = await prisma.boat.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updatedBoat);
  } catch (error) {
    console.error('Error updating boat:', error);
    res.status(500).json({ error: 'Failed to update boat' });
  }
});

// Delete boat (owner only)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const boat = await prisma.boat.findUnique({
      where: { id: req.params.id },
    });

    if (!boat) {
      return res.status(404).json({ error: 'Boat not found' });
    }

    if (boat.ownerId !== req.user!.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.boat.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Boat deleted successfully' });
  } catch (error) {
    console.error('Error deleting boat:', error);
    res.status(500).json({ error: 'Failed to delete boat' });
  }
});

export default router;
