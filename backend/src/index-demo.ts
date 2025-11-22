import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { mockBoats, mockBookings, mockReviews, mockUsers } from './mockData';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock authentication
let currentUser = mockUsers[0];

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { email, name, role } = req.body;
  const user = {
    id: String(Date.now()),
    email,
    name,
    role: role || 'CUSTOMER',
  };
  currentUser = user;
  res.status(201).json({
    user,
    token: 'demo-token-' + Date.now(),
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const user = mockUsers.find(u => u.email === email) || mockUsers[0];
  currentUser = user;
  res.json({
    user,
    token: 'demo-token-' + Date.now(),
  });
});

// Boat routes
app.get('/api/boats', (req, res) => {
  let boats = [...mockBoats];

  const { type, location, minPrice, maxPrice, capacity } = req.query;

  if (type) {
    boats = boats.filter(b => b.type === type);
  }
  if (location) {
    boats = boats.filter(b =>
      b.location.toLowerCase().includes((location as string).toLowerCase())
    );
  }
  if (minPrice) {
    boats = boats.filter(b => b.pricePerDay >= Number(minPrice));
  }
  if (maxPrice) {
    boats = boats.filter(b => b.pricePerDay <= Number(maxPrice));
  }
  if (capacity) {
    boats = boats.filter(b => b.capacity >= Number(capacity));
  }

  res.json(boats);
});

app.get('/api/boats/:id', (req, res) => {
  const boat = mockBoats.find(b => b.id === req.params.id);
  if (!boat) {
    return res.status(404).json({ error: 'Boat not found' });
  }
  res.json(boat);
});

app.post('/api/boats', (req, res) => {
  const newBoat = {
    id: String(Date.now()),
    ...req.body,
    ownerId: currentUser.id,
    available: true,
    owner: currentUser,
    averageRating: 0,
    reviewCount: 0,
    reviews: [],
  };
  mockBoats.push(newBoat);
  res.status(201).json(newBoat);
});

// Booking routes
app.get('/api/bookings', (req, res) => {
  res.json(mockBookings);
});

app.get('/api/bookings/owner', (req, res) => {
  res.json(mockBookings);
});

app.post('/api/bookings', (req, res) => {
  const { boatId, startDate, endDate } = req.body;
  const boat = mockBoats.find(b => b.id === boatId);

  if (!boat) {
    return res.status(404).json({ error: 'Boat not found' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice = boat.pricePerDay * days;

  const newBooking = {
    id: String(Date.now()),
    boatId,
    customerId: currentUser.id,
    startDate,
    endDate,
    totalPrice,
    status: 'PENDING',
    boat,
  };

  mockBookings.push(newBooking);
  res.status(201).json(newBooking);
});

app.patch('/api/bookings/:id/status', (req, res) => {
  const booking = mockBookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  booking.status = req.body.status;
  res.json(booking);
});

// Review routes
app.get('/api/reviews/boat/:boatId', (req, res) => {
  const reviews = mockReviews.filter(r => r.boatId === req.params.boatId);
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  const { boatId, rating, comment } = req.body;
  const newReview = {
    id: String(Date.now()),
    boatId,
    userId: currentUser.id,
    rating,
    comment,
    createdAt: new Date().toISOString(),
    user: {
      id: currentUser.id,
      name: currentUser.name,
    },
  };
  mockReviews.push(newReview);
  res.status(201).json(newReview);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Boat Rental API is running (Demo Mode with Mock Data)'
  });
});

app.listen(PORT, () => {
  console.log(`\n🚤 Boat Rental API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`⚠️  Running in DEMO mode with mock data\n`);
});
