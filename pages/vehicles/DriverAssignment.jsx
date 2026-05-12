import React, { useState, useEffect } from 'react';
import { fetchVehicles, assignDriver } from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

const DriverAssignment = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [driverData, setDriverData] = useState({ driverName: '', licenseNumber: '', phone: '', assignmentDate: '', notes: '' });

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

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDriverData({
      driverName: vehicle.driver?.name || '',
      licenseNumber: vehicle.driver?.licenseNumber || '',
      phone: vehicle.driver?.phone || '',
      assignmentDate: vehicle.driver?.assignmentDate || '',
      notes: vehicle.driver?.notes || ''
    });
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    try {
      await assignDriver(selectedVehicle._id, driverData);
      loadVehicles();
      setSelectedVehicle(null);
      alert('Driver assigned successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign driver');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Driver Assignment</h1>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={styles.sectionTitle}>Fleet Selection</h2>
          {loading ? <div style={styles.loading}>Syncing fleet...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {vehicles.map(vehicle => (
                <div 
                  key={vehicle._id} 
                  onClick={() => handleSelectVehicle(vehicle)}
                  style={selectedVehicle?._id === vehicle._id ? {...styles.vehicleCard, ...styles.vehicleCardSelected} : styles.vehicleCard}
                >
                  <div style={{ fontWeight: '600' }}>{vehicle.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>{vehicle.plateNumber}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <AnimatePresence mode="wait">
            {selectedVehicle ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={styles.formCard}>
                  <h2 style={styles.sectionTitle}>Assignment for {selectedVehicle.name}</h2>
                  <form onSubmit={handleAssign} style={styles.form}>
                    <div style={styles.formGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Driver Name *</label>
                        <input style={styles.input} value={driverData.driverName} onChange={(e) => setDriverData({...driverData, driverName: e.target.value})} required />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>License Number *</label>
                        <input style={styles.input} value={driverData.licenseNumber} onChange={(e) => setDriverData({...driverData, licenseNumber: e.target.value})} required />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Contact Phone *</label>
                        <input style={styles.input} type="tel" value={driverData.phone} onChange={(e) => setDriverData({...driverData, phone: e.target.value})} required />
                      </div>
                    </div>
                    <button type="submit" style={styles.submitButton}>Confirm Assignment</button>
                  </form>
                </div>
              </motion.div>
            ) : <div style={{...styles.formCard, textAlign: 'center', padding: '60px'}}>Select a vehicle to assign a driver</div>}
          </AnimatePresence>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{vehicles.length}</div>
          <div style={styles.summaryLabel}>Total Fleet</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{vehicles.filter(v => v.driver).length}</div>
          <div style={styles.summaryLabel}>Drivers Active</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{vehicles.filter(v => !v.driver).length}</div>
          <div style={styles.summaryLabel}>Unassigned</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:     { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title:         { fontSize: '28px', fontWeight: '600', color: 'var(--color-text)' },
  error:         { padding: '12px', backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--color-error)' },
  formCard:      { backgroundColor: 'var(--color-surface)', padding: '20px', borderRadius: '12px', boxShadow: 'var(--color-card-shadow)', marginBottom: '24px', border: '1px solid var(--color-border)' },
  sectionTitle:  { fontSize: '18px', fontWeight: '600', color: 'var(--color-text)', marginBottom: '16px' },
  form:          { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGrid:      { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
  formGroup:     { display: 'flex', flexDirection: 'column', gap: '8px' },
  label:         { fontSize: '14px', fontWeight: '500', color: 'var(--color-text)' },
  input:         { padding: '12px', fontSize: '14px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text)' },
  submitButton:  { padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', alignSelf: 'flex-start' },
  cancelButton:  { padding: '12px 24px', backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  vehicleCard:   { backgroundColor: 'var(--color-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', cursor: 'pointer' },
  vehicleCardSelected: { borderColor: 'var(--color-primary)', backgroundColor: 'var(--color-primary-50)' },
  summaryGrid:   { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '32px' },
  summaryCard:   { backgroundColor: 'var(--color-surface)', padding: '20px', borderRadius: '12px', boxShadow: 'var(--color-card-shadow)', textAlign: 'center', border: '1px solid var(--color-border)' },
  summaryValue:  { fontSize: '28px', fontWeight: '600', color: 'var(--color-primary)' },
  summaryLabel:  { fontSize: '14px', color: 'var(--color-text-light)', marginTop: '4px' },
  loading:       { textAlign: 'center', padding: '20px', color: 'var(--color-text-light)' }
};

export default DriverAssignment;
