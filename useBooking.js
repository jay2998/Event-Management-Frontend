import { useState } from 'react';
import apiClient from '../api/client';
import { toast } from 'react-hot-toast';

export const useBooking = () => {
  const [isBooking, setIsBooking] = useState(false);

  const createBooking = async (bookingData) => {
    setIsBooking(true);
    const loadingToast = toast.loading('Securing your slot...');

    try {
      // The backend uses Mongoose transactions (slow but safe)
      const response = await apiClient.post('/bookings', bookingData);
      
      if (response.data.success) {
        toast.success('Booking confirmed successfully!', { id: loadingToast });
        return response.data.data;
      }
    } catch (error) {
      // Handle specific error messages from bookingController.js
      const message = error.response?.data?.message || 'Booking failed. Slot might be taken.';
      toast.error(message, { id: loadingToast });
    } finally {
      setIsBooking(false);
    }
  };

  return { createBooking, isBooking };
};