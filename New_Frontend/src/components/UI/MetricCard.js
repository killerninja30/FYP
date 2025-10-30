import React from 'react';
import './MetricCard.css';

const MetricCard = ({ 
  title, 
  value, 
  unit = '', 
  icon, 
  trend, 
  trendValue, 
  color = 'primary',
  size = 'normal'
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  const getTrendClass = () => {
    if (trend === 'up') return 'trend-up';
    if (trend === 'down') return 'trend-down';
    return 'trend-neutral';
  };

  return (
    <div className={`metric-card metric-card-${color} metric-card-${size}`}>
      <div className="metric-header">
        <div className="metric-icon">{icon}</div>
        {trend && (
          <div className={`metric-trend ${getTrendClass()}`}>
            <span className="trend-icon">{getTrendIcon()}</span>
            <span className="trend-value">{trendValue}</span>
          </div>
        )}
      </div>
      
      <div className="metric-content">
        <div className="metric-value">
          {value}
          {unit && <span className="metric-unit">{unit}</span>}
        </div>
        <div className="metric-title">{title}</div>
      </div>
    </div>
  );
};

export default MetricCard;