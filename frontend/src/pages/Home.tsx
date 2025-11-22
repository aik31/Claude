import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      <div className="hero">
        <h1>🚤 Uber for Boats</h1>
        <p>Rent amazing boats in your area. Anytime, anywhere.</p>
        <Link to="/boats" className="btn btn-primary" style={{ marginTop: '2rem' }}>
          Browse Boats
        </Link>
      </div>

      <div className="container">
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>
          How It Works
        </h2>
        <div className="grid">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">1. Find Your Boat</h3>
              <p className="card-text">
                Browse through our selection of boats available in your area.
                Filter by type, price, and capacity.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">2. Book Instantly</h3>
              <p className="card-text">
                Select your dates and book your perfect boat in just a few
                clicks. Instant confirmation.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">3. Enjoy the Water</h3>
              <p className="card-text">
                Meet the owner, get your boat, and enjoy your day on the water.
                It's that simple!
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
          <h2>Got a Boat?</h2>
          <p style={{ margin: '1rem 0', color: '#6b7280' }}>
            List your boat and start earning money when you're not using it.
          </p>
          <Link to="/register" className="btn btn-primary">
            Become a Host
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
