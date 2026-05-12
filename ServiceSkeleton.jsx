import React from 'react';
import './ServiceSkeleton.css';

const ServiceSkeleton = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image animated-bg"></div>
      <div className="skeleton-info">
        <div className="skeleton-text title animated-bg"></div>
        <div className="skeleton-text subtitle animated-bg"></div>
        <div className="skeleton-footer">
          <div className="skeleton-text price animated-bg"></div>
          <div className="skeleton-button animated-bg"></div>
        </div>
      </div>
    </div>
  );
};

export const ServiceGridSkeleton = ({ count = 6 }) => (
  <div className="service-grid">
    {Array(count).fill(0).map((_, i) => <ServiceSkeleton key={i} />)}
  </div>
);