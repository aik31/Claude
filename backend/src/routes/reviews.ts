import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Create a review
router.post(
  '/',
  authenticate,
  [
    body('boatId').isUUID(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().trim(),
  ],
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { boatId, rating, comment } = req.body;

    try {
      // Check if user has completed a booking for this boat
      const completedBooking = await prisma.booking.findFirst({
        where: {
          boatId,
          customerId: req.user!.userId,
          status: 'COMPLETED',
        },
      });

      if (!completedBooking) {
        return res.status(400).json({
          error: 'You can only review boats you have completed bookings for',
        });
      }

      // Check if user already reviewed this boat
      const existingReview = await prisma.review.findFirst({
        where: {
          boatId,
          userId: req.user!.userId,
        },
      });

      if (existingReview) {
        return res
          .status(400)
          .json({ error: 'You have already reviewed this boat' });
      }

      const review = await prisma.review.create({
        data: {
          boatId,
          userId: req.user!.userId,
          rating,
          comment,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          boat: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.status(201).json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: 'Failed to create review' });
    }
  }
);

// Get reviews for a boat
router.get('/boat/:boatId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { boatId: req.params.boatId },
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
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default router;
