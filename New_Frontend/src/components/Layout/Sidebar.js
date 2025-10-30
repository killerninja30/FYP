import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      path: '/dashboard',
      icon: '📊',
      label: 'Dashboard',
      description: 'Overview and metrics'
    },
    {
      path: '/monitoring',
      icon: '📈',
      label: 'Monitoring',
      description: 'Real-time data'
    },
    {
      path: '/occupancy',
      icon: '👥',
      label: 'Occupancy',
      description: 'People detection'
    },
    {
      path: '/zone-control',
      icon: '🎛️',
      label: 'Zone Control',
      description: 'Zone management'
    },
    {
      path: '/energy-analytics',
      icon: '⚡',
      label: 'Analytics',
      description: 'Energy insights'
    },
    {
      path: '/device-control',
      icon: '🔌',
      label: 'Devices',
      description: 'Device control'
    },
    {
      path: '/smart-detection',
      icon: '🤖',
      label: 'Smart Detection',
      description: 'AI Detection'
    }
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '▶️' : '◀️'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
            title={isCollapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && (
              <div className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>
      
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="system-info">
            <div className="info-item">
              <span className="info-label">Backend Status</span>
              <span className="info-value status-active">Online</span>
            </div>
            <div className="info-item">
              <span className="info-label">Version</span>
              <span className="info-value">v1.0.0</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;