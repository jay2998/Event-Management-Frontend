import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useDebounce } from '../hooks/useDebounce';
import { ServiceGridSkeleton } from '../components/ServiceSkeleton';
import ServiceCard from './ServiceCard';
import { Helmet } from 'react-helmet-async';

const ServiceListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const fetchServices = async (pageNum, isNewSearch = false) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/services/search`, {
        params: { q: debouncedSearch, page: pageNum, limit: 12 }
      });
      
      if (isNewSearch) {
        setServices(data.data);
      } else {
        setServices(prev => [...prev, ...data.data]);
      }
      
      setHasMore(data.data.length === 12);
    } catch (error) {
      console.error("Failed to fetch services", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchServices(1, true);
  }, [debouncedSearch]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchServices(nextPage, false);
  };

  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>Discover Services | EventPro</title>
      </Helmet>

      <input
        type="text"
        placeholder="Search for halls, cars, or catering..."
        className="input-field mb-8"
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading && page === 1 ? (
        <ServiceGridSkeleton count={8} />
      ) : services.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map(service => <ServiceCard key={service._id} service={service} />)}
          </div>
          
          {hasMore && (
            <div className="mt-12 text-center">
              <button 
                onClick={handleLoadMore} 
                disabled={loading}
                className="btn-outline px-8"
              >
                {loading ? 'Loading...' : 'Load More Services'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-gray-500">No services found matching "{searchTerm}"</div>
      )}
    </div>
  );
};

export default ServiceListPage;
