import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Boat {
  id: string;
  name: string;
  description: string;
  type: string;
  capacity: number;
  pricePerDay: number;
  location: string;
  imageUrl?: string;
  available: boolean;
  averageRating?: number;
  reviewCount?: number;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Booking {
  id: string;
  boatId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  boat: Boat;
}

export interface Review {
  id: string;
  boatId: string;
  rating: number;
  comment?: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
};

export const boatsAPI = {
  getAll: async (params?: {
    type?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    capacity?: number;
  }) => {
    const response = await api.get('/boats', { params });
    return response.data as Boat[];
  },
  getById: async (id: string) => {
    const response = await api.get(`/boats/${id}`);
    return response.data as Boat;
  },
  create: async (data: Partial<Boat>) => {
    const response = await api.post('/boats', data);
    return response.data as Boat;
  },
  update: async (id: string, data: Partial<Boat>) => {
    const response = await api.put(`/boats/${id}`, data);
    return response.data as Boat;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/boats/${id}`);
    return response.data;
  },
};

export const bookingsAPI = {
  getAll: async () => {
    const response = await api.get('/bookings');
    return response.data as Booking[];
  },
  getOwnerBookings: async () => {
    const response = await api.get('/bookings/owner');
    return response.data as Booking[];
  },
  create: async (data: {
    boatId: string;
    startDate: string;
    endDate: string;
  }) => {
    const response = await api.post('/bookings', data);
    return response.data as Booking;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data as Booking;
  },
};

export const reviewsAPI = {
  getByBoat: async (boatId: string) => {
    const response = await api.get(`/reviews/boat/${boatId}`);
    return response.data as Review[];
  },
  create: async (data: {
    boatId: string;
    rating: number;
    comment?: string;
  }) => {
    const response = await api.post('/reviews', data);
    return response.data as Review;
  },
};

export default api;
