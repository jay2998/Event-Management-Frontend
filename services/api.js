import axios from 'axios';

// Global Toast Helper
export const notify = (message, type = 'info') => {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type } }));
};

// IMPORTANT: If testing on a real mobile phone, replace 'localhost' 
// with your computer's IP address (e.g., 192.168.10.5)
const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getProfile = () => API.get('/auth/me');

// Response interceptor for 401 handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    
    if (error.response?.status === 401) {
      console.error('Unauthorized! Redirecting to login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else {
      notify(message, 'error');
    }
    return Promise.reject(error);
  }
);

// User Management API (Admin only)
export const fetchUsers = () => API.get('/auth/users');
export const createUser = (data) => API.post('/auth/users', data);
export const updateUser = (id, data) => API.put(`/auth/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/auth/users/${id}`);

// Bookings API
export const createBooking = (data) => API.post('/bookings', data);
export const fetchBookings = (params) => API.get('/bookings', { params });
export const fetchBooking = (id) => API.get(`/bookings/${id}`);
export const updateBooking = (id, data) => API.put(`/bookings/${id}`, data);
export const deleteBooking = (id) => API.delete(`/bookings/${id}`);
export const fetchBookingMenu = (bookingId) => API.get(`/bookings/${bookingId}/menu`);
export const updateBookingMenu = (bookingId, menuItems) => API.put(`/bookings/${bookingId}/menu`, { menuItems });
export const fetchBookingInvoice = (bookingId) => API.get(`/bookings/${bookingId}/invoice`);
export const fetchStats = () => API.get('/bookings/stats');


// Inventory API
export const fetchInventory = (params) => API.get('/inventory', { params });
export const fetchInventoryItem = (id) => API.get(`/inventory/${id}`);
export const createInventoryItem = (data) => API.post('/inventory', data);
export const updateInventoryItem = (id, data) => API.put(`/inventory/${id}`, data);
export const deleteInventoryItem = (id) => API.delete(`/inventory/${id}`);

// Rentals API
export const fetchRentals = (params) => API.get('/rentals', { params });
export const fetchRental = (id) => API.get(`/rentals/${id}`);
export const createRental = (data) => API.post('/rentals', data);
export const updateRental = (id, data) => API.put(`/rentals/${id}`, data);
export const deleteRental = (id) => API.delete(`/rentals/${id}`);
export const fetchVendorRentals = () => API.get('/rentals/vendor/my-rentals');
export const addRentalItem = (id, data) => API.post(`/rentals/${id}/items`, data);
export const updateRentalItem = (id, itemId, data) => API.put(`/rentals/${id}/items/${itemId}`, data);
export const deleteRentalItem = (id, itemId) => API.delete(`/rentals/${id}/items/${itemId}`);


// Halls API
export const fetchHalls = (params) => API.get('/halls', { params });
export const fetchHall = (id) => API.get(`/halls/${id}`);
export const createHall = (data) => API.post('/halls', data);
export const updateHall = (id, data) => API.put(`/halls/${id}`, data);
export const deleteHall = (id) => API.delete(`/halls/${id}`);
export const fetchVendorHalls = () => API.get('/halls/vendor/my-halls');

// Catering API
export const fetchCateringOrders = () => API.get('/catering');
export const createCateringOrder = (data) => API.post('/catering', data);
export const updateCateringOrder = (id, data) => API.put(`/catering/${id}`, data);
export const fetchCateringMenu = () => API.get('/catering/menu');
export const createCateringMenuItem = (data) => API.post('/catering/menu', data);
export const fetchMenuDraft = (bookingId) => API.get('/catering/menu-draft', { params: bookingId ? { bookingId } : {} });
export const saveMenuDraft = (data) => API.post('/catering/menu-draft', data);

// Vehicles API
export const fetchVehicles = () => API.get('/vehicles');
export const fetchVehicle = (id) => API.get(`/vehicles/${id}`);
export const createVehicle = (data) => API.post('/vehicles', data);
export const updateVehicle = (id, data) => API.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => API.delete(`/vehicles/${id}`);
export const assignDriver = (vehicleId, driverId) => API.post(`/vehicles/${vehicleId}/assign`, { driverId });

// Notifications API
export const fetchNotifications = () => API.get('/notifications');
export const markNotificationsRead = () => API.put('/notifications/read-all');

export default API;
