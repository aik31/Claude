import React, { useState, useEffect } from 'react';
import { bookingsAPI, Booking } from '../services/api';

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await bookingsAPI.getAll();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingsAPI.updateStatus(id, 'CANCELLED');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      PENDING: 'badge-yellow',
      CONFIRMED: 'badge-blue',
      CANCELLED: 'badge-red',
      COMPLETED: 'badge-green',
    };
    return badges[status] || 'badge-blue';
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>My Bookings</h1>

      {bookings.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280' }}>
          You haven't made any bookings yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map((booking) => (
            <div key={booking.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 className="card-title">{booking.boat.name}</h3>
                    <p className="card-text">
                      <strong>Location:</strong> {booking.boat.location}
                    </p>
                    <p className="card-text">
                      <strong>Dates:</strong>{' '}
                      {new Date(booking.startDate).toLocaleDateString()} -{' '}
                      {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                    <p className="card-text">
                      <strong>Total Price:</strong> ${Number(booking.totalPrice).toFixed(2)}
                    </p>
                    <p className="card-text">
                      <strong>Owner:</strong> {booking.boat.owner.name} ({booking.boat.owner.email})
                    </p>
                    <div style={{ marginTop: '0.5rem' }}>
                      <span className={`badge ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    {booking.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="btn btn-danger"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
