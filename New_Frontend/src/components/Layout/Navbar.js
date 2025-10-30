import React, { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <div className="logo">
            <div className="logo-icon">⚡</div>
            <span className="logo-text">IoT Energy Management</span>
          </div>
        </div>
        
        <div className="navbar-center">
          <div className="status-indicator">
            <span className="status-dot status-active"></span>
            <span className="status-text">System Online</span>
          </div>
        </div>
        
        <div className="navbar-right">
          <div className="time-display">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="user-profile">
            <div className="user-avatar">A</div>
            <span className="user-name">Admin</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;