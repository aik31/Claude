import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { boatsAPI, bookingsAPI, reviewsAPI, Boat, Review } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BoatDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [boat, setBoat] = useState<Boat | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      fetchBoatDetails();
      fetchReviews();
    }
  }, [id]);

  const fetchBoatDetails = async () => {
    try {
      const data = await boatsAPI.getById(id!);
      setBoat(data);
    } catch (error) {
      console.error('Error fetching boat:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await reviewsAPI.getByBoat(id!);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await bookingsAPI.create({
        boatId: id!,
        startDate,
        endDate,
      });
      setSuccess('Booking created successfully! Check your bookings page.');
      setStartDate('');
      setEndDate('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Booking failed');
    }
  };

  if (loading) {
    return <div className="loading">Loading boat details...</div>;
  }

  if (!boat) {
    return <div className="container">Boat not found</div>;
  }

  const calculatePrice = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days * Number(boat.pricePerDay) : 0;
  };

  return (
    <div className="container">
      <div className="detail-header">
        <div>
          <div
            className="detail-image"
            style={{
              backgroundImage: boat.imageUrl ? `url(${boat.imageUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!boat.imageUrl && (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '6rem',
                }}
              >
                🚤
              </div>
            )}
          </div>
        </div>
        <div className="detail-info">
          <h1>{boat.name}</h1>
          <div style={{ marginBottom: '1rem' }}>
            <span className="badge badge-blue">{boat.type}</span>
            {boat.available ? (
              <span className="badge badge-green" style={{ marginLeft: '0.5rem' }}>
                Available
              </span>
            ) : (
              <span className="badge badge-red" style={{ marginLeft: '0.5rem' }}>
                Unavailable
              </span>
            )}
          </div>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{boat.description}</p>
          <div style={{ marginBottom: '1rem' }}>
            <p>
              <strong>Location:</strong> {boat.location}
            </p>
            <p>
              <strong>Capacity:</strong> {boat.capacity} people
            </p>
            <p>
              <strong>Owner:</strong> {boat.owner.name}
            </p>
          </div>
          {boat.averageRating !== undefined && boat.averageRating > 0 && (
            <div className="rating">
              <span className="stars">⭐</span>
              <span>
                {boat.averageRating.toFixed(1)} ({boat.reviewCount} reviews)
              </span>
            </div>
          )}
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' }}>
            ${Number(boat.pricePerDay).toFixed(0)}/day
          </p>
        </div>
      </div>

      {boat.available && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-body">
            <h2>Book This Boat</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              {calculatePrice() > 0 && (
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  Total: ${calculatePrice().toFixed(2)}
                </p>
              )}
              <button type="submit" className="btn btn-primary">
                Book Now
              </button>
            </form>
          </div>
        </div>
      )}

      <div>
        <h2 style={{ marginBottom: '1rem' }}>Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No reviews yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map((review) => (
              <div key={review.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>{review.user.name}</strong>
                    <div className="rating">
                      <span className="stars">⭐</span>
                      <span>{review.rating}/5</span>
                    </div>
                  </div>
                  {review.comment && <p style={{ color: '#6b7280' }}>{review.comment}</p>}
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoatDetails;
