import React, { useState, useEffect } from 'react';
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/ui/Card';
import { Pencil, Trash2 } from 'lucide-react';

const VehicleFleet = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch { return {}; }
  };
  const user = getUser();
  const isCustomer = user.role === 'customer';

  const [formData, setFormData] = useState({
    name: '',
    vehicleNumber: '',
    type: 'sedan',
    capacity: 4,
    status: 'available',
    features: '',
    city: '',
    perDayCharge: '',
    farePerKm: '',
    images: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetchVehicles();
      setVehicles(response.data?.data || []);
    } catch (err) {
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      
      // Append basic fields
      Object.keys(formData).forEach(key => {
        if (key !== 'images') data.append(key, formData[key]);
      });

      // Fix: Include vendorId from the logged-in user to satisfy backend requirements
      if (user?._id || user?.id) {
        data.append('vendorId', user._id || user.id);
      }

      // Append files
      selectedFiles.forEach(file => {
        data.append('images', file);
      });

      if (currentVehicle?._id) {
        await updateVehicle(currentVehicle._id, data);
      } else {
        await createVehicle(data);
      }
      setShowForm(false);
      setCurrentVehicle(null);
      setFormData({ 
        name: '', 
        vehicleNumber: '', 
        type: 'sedan', 
        capacity: 4, 
        status: 'available', 
        features: '', 
        city: '', 
        perDayCharge: '', 
        farePerKm: '',
        images: ''
      });
      setSelectedFiles([]);
      loadVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vehicle');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleEdit = (vehicle) => {
    setCurrentVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      vehicleNumber: vehicle.vehicleNumber || vehicle.plateNumber || '',
      type: vehicle.type,
      capacity: vehicle.capacity,
      status: vehicle.status,
      features: Array.isArray(vehicle.features) ? vehicle.features.join(', ') : '',
      city: vehicle.city || '',
      perDayCharge: vehicle.perDayCharge || '',
      farePerKm: vehicle.farePerKm || '',
      images: Array.isArray(vehicle.images) ? vehicle.images.join(', ') : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await deleteVehicle(vehicleId);
      loadVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'available':   return { bg: '#f0fdfa', text: '#0d9488', border: '#ccfbf1' };
      case 'in_use':      return { bg: '#fffbeb', text: '#d97706', border: '#fef3c7' };
      case 'maintenance': return { bg: '#fff1f2', text: '#e11d48', border: '#ffe4e6' };
      default:            return { bg: '#f8fafc', text: '#64748b', border: '#f1f5f9' };
    }
  };

  const vehicleCategories = [
    { value: 'sedan', label: 'Luxury Sedan (Civic/Corolla)' },
    { value: 'suv', label: 'Premium SUV (Land Cruiser V8)' },
    { value: 'luxury', label: 'Executive (Audi/Mercedes)' },
    { value: 'van', label: 'Guest Van (Hiace/Grand Cabin)' },
    { value: 'bus', label: 'Bus (Coaster/Daewoo)' },
    { value: 'decorated', label: 'Wedding Decorated Special' },
  ];

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.vehicleNumber || v.plateNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{isCustomer ? 'Wedding Fleet' : 'Fleet Management'}</h1>
        {!isCustomer && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              setCurrentVehicle(null);
              setSelectedFiles([]);
              setFormData({ 
                name: '', 
                vehicleNumber: '', 
                type: 'sedan', 
                capacity: 4, 
                status: 'available', 
                features: '', 
                city: '', 
                perDayCharge: '', 
                farePerKm: '',
                images: ''
              });
            }}
            style={styles.addButton}
          >
            {showForm ? 'Close Form' : '+ Register Vehicle'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && !isCustomer && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div style={styles.formCard}>
              <h2 style={styles.sectionTitle}>{currentVehicle ? 'Update Asset' : 'Register New Vehicle'}</h2>
              <form onSubmit={handleSubmit} style={styles.form}>
                 <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                       <label style={styles.label}>Vehicle Name / Model *</label>
                       <input style={styles.input} name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Honda Civic RS" required />
                    </div>
                    <div style={styles.formGroup}>
                       <label style={styles.label}>Vehicle Number *</label>
                       <input style={styles.input} name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="LEA-1234" required />
                    </div>
                    <div style={styles.formGroup}>
                       <label style={styles.label}>Category *</label>
                       <select style={styles.select} name="type" value={formData.type} onChange={handleChange} required>
                          {vehicleCategories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                       </select>
                    </div>
                    <div style={styles.formGroup}>
                       <label style={styles.label}>Capacity *</label>
                       <input type="number" style={styles.input} name="capacity" value={formData.capacity} onChange={handleChange} min="1" required />
                    </div>
                    <div style={styles.formGroup}>
                       <label style={styles.label}>Status</label>
                       <select style={styles.select} name="status" value={formData.status} onChange={handleChange}>
                          <option value="available">Available</option>
                          <option value="in_use">In Use</option>
                          <option value="maintenance">Maintenance</option>
                       </select>
                    </div>
                    <div style={styles.formGroup}>
                       <label style={styles.label}>City *</label>
                       <input style={styles.input} name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Lahore" required />
                    </div>
                    <div style={styles.formGroup}>
                       <label style={styles.label}>Per Day Charge *</label>
                       <input type="number" style={styles.input} name="perDayCharge" value={formData.perDayCharge} onChange={handleChange} placeholder="5000" required />
                    </div>
                    <div style={styles.formGroup}>
                       <label style={styles.label}>Fare Per KM *</label>
                       <input type="number" style={styles.input} name="farePerKm" value={formData.farePerKm} onChange={handleChange} placeholder="50" required />
                    </div>
                    <div style={styles.formGroup}>
                       <label style={styles.label}>Features (comma separated)</label>
                       <input style={styles.input} name="features" value={formData.features} onChange={handleChange} placeholder="AC, GPS, Bluetooth" />
                    </div>
                    <div style={styles.formGroup}>
                       <label style={styles.label}>Vehicle Images (JPEG/PNG)</label>
                       <input 
                        type="file" 
                        style={styles.input} 
                        onChange={handleFileChange} 
                        accept="image/jpeg,image/png" 
                        multiple 
                       />
                    </div>
                 </div>
                 <button type="submit" style={styles.submitButton}>Confirm Registration</button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginBottom: '24px' }}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search fleet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      {loading ? (
        <div style={styles.loading}>Loading fleet data...</div>
      ) : (
        <div style={styles.vehicleGrid}>
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle._id} style={styles.vehicleCard}>
              {vehicle.images?.[0] && (
                <div style={styles.imageContainer}>
                  <img src={vehicle.images[0].startsWith('http') ? vehicle.images[0] : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${vehicle.images[0]}`} alt={vehicle.name} style={styles.vehicleImage} />
                </div>
              )}
              <div style={styles.vehicleHeader}>
                 <span style={styles.vehicleIcon}>
                   {!vehicle.images?.[0] && (vehicle.type === 'suv' ? '🚙' : vehicle.type === 'bus' ? '🚌' : '🚗')}
                 </span>
                 <span style={{...styles.categoryBadge, backgroundColor: getStatusStyle(vehicle.status).bg, color: getStatusStyle(vehicle.status).text}}>
                   {vehicle.status?.replace('_', ' ')}
                 </span>
              </div>
              <h3 style={styles.vehicleName}>{vehicle.name}</h3>
              <div style={styles.vehicleInfo}>
                <span>{vehicle.vehicleNumber || vehicle.plateNumber}</span>
                <span>{vehicle.capacity} Seats • {vehicle.type?.replace('_', ' ')} • {vehicle.city}</span>
              </div>
              {!isCustomer && (
                <div style={styles.vehicleActions} className="justify-end">
                   <button
                     type="button"
                     onClick={() => handleEdit(vehicle)}
                     style={{
                       ...styles.iconBtn,
                       backgroundColor: 'var(--color-primary-50)',
                       color: 'var(--color-primary)',
                       border: '1px solid var(--color-primary-100)'
                     }}
                   >
                     <Pencil size={18} />
                   </button>
                   <button
                     type="button"
                     onClick={() => handleDelete(vehicle._id)}
                     style={{
                       ...styles.iconBtn,
                       backgroundColor: 'var(--color-error-light)',
                       color: 'var(--color-error)',
                       border: '1px solid var(--color-error)'
                     }}
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{vehicles.length}</div>
          <div style={styles.summaryLabel}>Total Fleet</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{vehicles.filter(v => v.status === 'available').length}</div>
          <div style={styles.summaryLabel}>Available</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{vehicles.filter(v => v.type === 'sedan').length}</div>
          <div style={styles.summaryLabel}>Sedans</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:     { padding: '28px', maxWidth: '1200px', margin: '0 auto' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title:         { fontSize: '30px', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '-0.4px' },
  addButton:     { padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  formCard:      { backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--color-card-shadow)', marginBottom: '24px', border: '1px solid rgba(13,148,136,0.14)' },
  sectionTitle:  { fontSize: '19px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '16px', letterSpacing: '-0.2px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', rowGap: '32px', columnGap: '20px', alignItems: 'start' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 },
  label:         { fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' },
  input:         { padding: '12px 14px', fontSize: '14px', border: '1px solid var(--color-border)', borderRadius: '12px', backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text)' },
  imageContainer:{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' },
  vehicleImage:  { width: '100%', height: '100%', objectFit: 'cover' },
  select:        { padding: '12px 14px', fontSize: '14px', border: '1px solid var(--color-border)', borderRadius: '12px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' },
  submitButton:  { padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', alignSelf: 'flex-start' },
  searchInput:   { padding: '13px 14px', border: '1px solid var(--color-border)', borderRadius: '14px', width: '100%', maxWidth: '400px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' },
  vehicleGrid:   { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' },
  vehicleCard:   { backgroundColor: 'var(--color-surface)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--color-card-shadow)', border: '1px solid rgba(13,148,136,0.14)' },
  vehicleHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  vehicleIcon:   { fontSize: '32px' },
  categoryBadge: { padding: '4px 10px', borderRadius: '999px', fontSize: '12px', textTransform: 'capitalize' },
  vehicleName:   { fontSize: '17px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '8px' },
  vehicleInfo:   { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--color-text-light)', marginBottom: '12px' },
  vehicleActions:{ display: 'flex', gap: '8px' },
  iconBtn: { width: '36px', height: '36px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, border: '1px solid var(--color-primary-100)', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary)' },
  dangerIconBtn: { width: '36px', height: '36px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, border: '1px solid var(--color-error)', backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' },
  editButton:    { flex: 1, padding: '8px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  deleteButton:  { flex: 1, padding: '8px', backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)', border: '1px solid var(--color-error)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  loading:       { textAlign: 'center', padding: '40px', color: 'var(--color-text-light)' },
  summaryGrid:   { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '32px' },
  summaryCard:   { backgroundColor: 'var(--color-surface)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--color-card-shadow)', textAlign: 'center', border: '1px solid rgba(13,148,136,0.14)' },
  summaryValue:  { fontSize: '30px', fontWeight: '700', color: 'var(--color-primary-dark)', letterSpacing: '-0.4px' },
  summaryLabel:  { fontSize: '14px', color: 'var(--color-text-light)', marginTop: '4px', lineHeight: 1.35 }
};

export default VehicleFleet;
