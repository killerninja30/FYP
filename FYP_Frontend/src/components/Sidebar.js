import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaBars,
  FaHome,
  FaDesktop,
  FaBolt,
  FaUsers,
  FaCog,
  FaChartBar,
  FaMapMarkerAlt,
  FaMobile,
  FaCamera,
  FaShieldAlt
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { path: '/', icon: FaHome, label: 'Dashboard', color: '#3b82f6' },
    { path: '/monitoring', icon: FaDesktop, label: 'Real-time Monitoring', color: '#10b981' },
    { path: '/occupancy', icon: FaUsers, label: 'Occupancy Detection', color: '#f59e0b' },
    { path: '/zone-control', icon: FaMapMarkerAlt, label: 'Zone Control', color: '#8b5cf6' },
    { path: '/energy-analytics', icon: FaChartBar, label: 'Energy Analytics', color: '#ef4444' },
    { path: '/device-control', icon: FaBolt, label: 'Device Control', color: '#06b6d4' },
    { path: '/mobile-app', icon: FaMobile, label: 'Mobile Control', color: '#84cc16' },
    { path: '/camera-feeds', icon: FaCamera, label: 'Camera Feeds', color: '#f97316' },
    { path: '/manual-override', icon: FaShieldAlt, label: 'Manual Override', color: '#ec4899' },
    { path: '/settings', icon: FaCog, label: 'Settings', color: '#6b7280' }
  ];

  return (
    <>
      {/* Hamburger for mobile */}
      <button className="sidebar-hamburger" onClick={() => setOpen(!open)} aria-label="Open sidebar">
        <FaBars size={28} />
      </button>
      {/* Overlay for mobile */}
      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-content">
          <nav className="sidebar-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  style={isActive ? { '--accent-color': item.color } : {}}
                >
                  <Icon size={20} style={{ color: item.color }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
