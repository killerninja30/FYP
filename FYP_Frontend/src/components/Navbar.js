import React from 'react';
import { Link } from 'react-router-dom';
import { FaPowerOff, FaCog, FaBell, FaUser } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <FaPowerOff className="brand-icon" />
        <span className="brand-text">Smart Energy Manager</span>
      </div>
      <div className="navbar-actions">
        <button className="nav-button">
          <FaBell size={20} />
          <span className="notification-badge">3</span>
        </button>
        <button className="nav-button">
          <FaCog size={20} />
        </button>
        <button className="nav-button profile-button">
          <FaUser size={20} />
          <span>Admin</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
