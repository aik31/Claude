# 🚤 Boat Rental App - Uber for Boats

A full-stack boat rental platform that connects boat owners with renters. Built with React, TypeScript, Node.js, Express, and PostgreSQL.

## Features

### For Customers
- Browse and search boats by type, location, price, and capacity
- View detailed boat information with photos and reviews
- Book boats for specific dates
- View and manage bookings
- Leave reviews and ratings after completed rentals

### For Boat Owners
- List boats with detailed information
- Manage boat availability
- View and manage booking requests
- Track rental income

### Platform Features
- JWT-based authentication
- Role-based access control (Customer, Owner, Admin)
- Real-time availability checking
- Review and rating system
- Responsive design

## Tech Stack

### Backend
- Node.js & Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React 18
- TypeScript
- React Router
- Axios
- Vite

## Project Structure

```
boat-rental-app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── boats.ts
│   │   │   ├── bookings.ts
│   │   │   └── reviews.ts
│   │   ├── utils/
│   │   │   └── auth.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Boats.tsx
│   │   │   ├── BoatDetails.tsx
│   │   │   └── Bookings.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd boat-rental-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:

Create a PostgreSQL database:
```bash
createdb boat_rental
```

4. Configure environment variables:

Create a `.env` file in the `backend` directory:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/boat_rental?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
NODE_ENV=development
```

5. Initialize the database:
```bash
cd backend
npm run db:push
```

### Running the Application

#### Development Mode

Run both frontend and backend concurrently:
```bash
npm run dev
```

Or run them separately:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

#### Production Build

Build both frontend and backend:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Boats
- `GET /api/boats` - Get all boats (with optional filters)
- `GET /api/boats/:id` - Get boat by ID
- `POST /api/boats` - Create a new boat (authenticated owners)
- `PUT /api/boats/:id` - Update boat (owner only)
- `DELETE /api/boats/:id` - Delete boat (owner only)

### Bookings
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/owner` - Get bookings for owner's boats
- `POST /api/bookings` - Create a new booking
- `PATCH /api/bookings/:id/status` - Update booking status

### Reviews
- `GET /api/reviews/boat/:boatId` - Get reviews for a boat
- `POST /api/reviews` - Create a review (after completed booking)

## Database Schema

### User
- id (UUID)
- email (unique)
- password (hashed)
- name
- phone
- role (CUSTOMER, OWNER, ADMIN)

### Boat
- id (UUID)
- name
- description
- type (enum: SAILBOAT, MOTORBOAT, YACHT, etc.)
- capacity
- pricePerDay
- location
- latitude/longitude
- imageUrl
- available
- ownerId (FK to User)

### Booking
- id (UUID)
- boatId (FK to Boat)
- customerId (FK to User)
- startDate
- endDate
- totalPrice
- status (PENDING, CONFIRMED, CANCELLED, COMPLETED)

### Review
- id (UUID)
- boatId (FK to Boat)
- userId (FK to User)
- rating (1-5)
- comment

## Usage

### As a Customer

1. Register as a customer
2. Browse available boats
3. Filter by type, location, price, or capacity
4. View boat details and reviews
5. Book a boat for specific dates
6. View and manage your bookings
7. Leave reviews after completed rentals

### As a Boat Owner

1. Register as an owner
2. List your boats with details and photos
3. Manage boat availability
4. View booking requests
5. Confirm or manage bookings

## Development Tools

### Database Management

View and edit database with Prisma Studio:
```bash
cd backend
npm run db:studio
```

### Useful Scripts

```bash
# Install all dependencies
npm install

# Run development servers
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Push database schema
cd backend && npm run db:push

# Open Prisma Studio
cd backend && npm run db:studio
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation
- CORS configuration
- SQL injection prevention (Prisma ORM)

## Future Enhancements

- Payment integration (Stripe)
- Real-time chat between owners and renters
- Boat location on maps
- Photo upload functionality
- Email notifications
- Calendar integration
- Mobile app
- Admin dashboard
- Advanced search with filters
- Boat insurance options

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@boatrental.com or open an issue in the repository.
