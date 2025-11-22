import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Boats from './pages/Boats';
import BoatDetails from './pages/BoatDetails';
import Bookings from './pages/Bookings';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/boats" element={<Boats />} />
            <Route path="/boats/:id" element={<BoatDetails />} />
            <Route path="/bookings" element={<Bookings />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
