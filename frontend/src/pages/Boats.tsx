import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { boatsAPI, Boat } from '../services/api';

const Boats: React.FC = () => {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    capacity: '',
  });

  useEffect(() => {
    fetchBoats();
  }, []);

  const fetchBoats = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.type) params.type = filters.type;
      if (filters.location) params.location = filters.location;
      if (filters.minPrice) params.minPrice = Number(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
      if (filters.capacity) params.capacity = Number(filters.capacity);

      const data = await boatsAPI.getAll(params);
      setBoats(data);
    } catch (error) {
      console.error('Error fetching boats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBoats();
  };

  if (loading) {
    return <div className="loading">Loading boats...</div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Find Your Perfect Boat</h1>

      <div className="search-box">
        <form onSubmit={handleSearch}>
          <div className="search-filters">
            <div className="form-group">
              <label>Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="SAILBOAT">Sailboat</option>
                <option value="MOTORBOAT">Motorboat</option>
                <option value="YACHT">Yacht</option>
                <option value="CATAMARAN">Catamaran</option>
                <option value="PONTOON">Pontoon</option>
                <option value="FISHING">Fishing</option>
                <option value="SPEEDBOAT">Speedboat</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                placeholder="City or region"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Min Price/Day</label>
              <input
                type="number"
                placeholder="$0"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Max Price/Day</label>
              <input
                type="number"
                placeholder="$1000"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                placeholder="Min capacity"
                value={filters.capacity}
                onChange={(e) => handleFilterChange('capacity', e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Search
          </button>
        </form>
      </div>

      {boats.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280' }}>
          No boats found. Try adjusting your filters.
        </p>
      ) : (
        <div className="grid">
          {boats.map((boat) => (
            <Link
              key={boat.id}
              to={`/boats/${boat.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card">
                <div
                  className="card-img"
                  style={{
                    backgroundImage: boat.imageUrl
                      ? `url(${boat.imageUrl})`
                      : 'none',
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
                        fontSize: '3rem',
                      }}
                    >
                      🚤
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <h3 className="card-title">{boat.name}</h3>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span className="badge badge-blue">{boat.type}</span>
                  </div>
                  <p className="card-text">
                    📍 {boat.location} • 👥 Capacity: {boat.capacity}
                  </p>
                  {boat.averageRating !== undefined && boat.averageRating > 0 && (
                    <div className="rating">
                      <span className="stars">⭐</span>
                      <span>
                        {boat.averageRating.toFixed(1)} ({boat.reviewCount}{' '}
                        reviews)
                      </span>
                    </div>
                  )}
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem' }}>
                    ${Number(boat.pricePerDay).toFixed(0)}/day
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Boats;
