import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          🚤 Boat Rental
        </Link>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/boats">Find Boats</Link>
          {isAuthenticated ? (
            <>
              <Link to="/bookings">My Bookings</Link>
              {user?.role === 'OWNER' && (
                <>
                  <Link to="/my-boats">My Boats</Link>
                  <Link to="/add-boat">Add Boat</Link>
                </>
              )}
              <button
                onClick={logout}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
