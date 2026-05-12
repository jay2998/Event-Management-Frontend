import React from 'react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  // Handle image path logic: fallback to a placeholder if no image exists
  const imageUrl = service.image 
    ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${service.image}`
    : 'https://via.placeholder.com/400x250?text=No+Image+Available';

  return (
    <div className="card overflow-hidden flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={service.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-2 right-2">
          <span className="badge">{service.category}</span>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="section-title mb-1">{service.name}</h3>
        <p className="summary-card-text line-clamp-2 mb-4">{service.description}</p>
        <div className="mt-auto flex justify-between items-center">
          <span className="text-xl font-bold text-primary">${service.basePrice}</span>
          <Link to={`/services/${service._id}`} className="btn-brand btn-small">Details</Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;