import React, { useState, useEffect } from 'react';
import { fetchRentals, updateRental } from '../../services/api';
import Card from '../../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench, // For header title and empty state
  Boxes, // For asset directory
  Clock, // For scheduled date
  CheckCircle2, // For checks done summary
  ListChecks, // For audit score summary
  Activity, // For active tasks summary
  Calendar, // For upcoming tasks summary
  DollarSign // For total spend summary
} from 'lucide-react';

const MaintenanceTracker = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [maintenanceData, setMaintenanceData] = useState({ type: '', scheduledDate: '', completedDate: '', cost: '', notes: '', status: 'scheduled' });

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      setLoading(true);
      const response = await fetchRentals();
      setRentals(response.data?.data || []);
    } catch (err) {
      setError('Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    if (selectedItem?._id === item._id) {
      setSelectedItem(null);
      setMaintenanceData({ type: '', scheduledDate: '', completedDate: '', cost: '', notes: '', status: 'scheduled' });
      return;
    }

    setSelectedItem(item);
    setMaintenanceData({
      type: item.maintenance?.type || 'routine',
      scheduledDate: item.maintenance?.scheduledDate || '',
      completedDate: item.maintenance?.completedDate || '',
      cost: item.maintenance?.cost || '',
      notes: item.maintenance?.notes || '',
      status: item.maintenance?.status || 'scheduled'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      await updateRental(selectedItem._id, { maintenance: maintenanceData });
      loadRentals();
      setSelectedItem(null);
      alert('Maintenance schedule updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update maintenance');
    }
  };

  const itemsNeedingMaintenance = rentals.filter(r => r.maintenance);
  const upcoming = itemsNeedingMaintenance.filter(i => i.maintenance.status === 'scheduled');
  const completed = itemsNeedingMaintenance.filter(i => i.maintenance.status === 'completed');

  const getStatusStyle = (status) => {
    if (status === 'scheduled') return 'bg-teal-50 text-teal-600 border-teal-100';
    if (status === 'in_progress') return 'bg-amber-50 text-amber-600 border-amber-100';
    if (status === 'completed') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--color-primary-50)] rounded-xl">
            <Wrench className="text-[var(--color-primary)]" size={24} />
          </div>
          <h1 style={styles.title}>Service & Repair Tracker</h1>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.summaryGrid} className="mb-8">
        <SummaryCard icon={<Activity className="text-teal-500" size={20} />} value={itemsNeedingMaintenance.length} label="Active Tasks" />
        <SummaryCard icon={<Calendar className="text-amber-500" size={20} />} value={upcoming.length} label="Upcoming" />
        <SummaryCard icon={<DollarSign className="text-emerald-500" size={20} />} value={`PKR ${itemsNeedingMaintenance.reduce((sum, i) => sum + (Number(i.maintenance?.cost) || 0), 0).toLocaleString()}`} label="Total Spend" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Items List */}
        <div className="lg:col-span-1">
          <Card title={<div className="space-y-1"><div className="text-lg font-semibold text-[var(--color-text)]">Asset Directory</div><div className="text-sm text-[var(--color-text-light)]">Tap an asset to schedule maintenance.</div></div>} className="h-full shadow-lg">
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="text-center py-10 opacity-50">Syncing data...</div>
              ) : (
                rentals.map(item => (
                  <div 
                    key={item._id} 
                    className={`p-5 rounded-2xl border-2 transition-all shadow-sm ${selectedItem?._id === item._id ? 'border-[var(--color-primary)] bg-[var(--color-primary-50)]' : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary-100)]'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-black text-[var(--color-text)] uppercase">{item.name}</span>
                      {item.maintenance && (
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${getStatusStyle(item.maintenance.status)}`}>
                          {item.maintenance.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-[var(--color-text-light)] uppercase tracking-wider mb-4">
                      <span className="flex items-center gap-1"><Boxes size={11} /> {item.category}</span>
                      {item.maintenance?.scheduledDate && (
                        <span>NEXT: {new Date(item.maintenance.scheduledDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleSelect(item)}
                        style={styles.tealButton}
                      >
                        {selectedItem?._id === item._id ? 'Close Service' : 'Schedule Service'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Maintenance Form */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card title="Schedule Maintenance">
                  <div className="p-5 bg-[var(--color-surface-soft)] rounded-2xl border border-[var(--color-border)] mb-6 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] font-black uppercase text-[var(--color-primary)] mb-1">Scheduling for</div>
                      <div className="text-lg font-black text-[var(--color-text)]">{selectedItem.name}</div>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Service Type *</label>
                        <select value={maintenanceData.type} onChange={(e) => setMaintenanceData({...maintenanceData, type: e.target.value})} style={styles.select} required>
                          <option value="routine">Routine Checkup</option>
                          <option value="repair">Technical Repair</option>
                          <option value="replacement">Partial Replacement</option>
                          <option value="calibration">Calibration</option>
                          <option value="cleaning">Deep Cleaning</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Task Status</label>
                        <select value={maintenanceData.status} onChange={(e) => setMaintenanceData({...maintenanceData, status: e.target.value})} style={styles.select}>
                          <option value="scheduled">Scheduled</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed / Verified</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Scheduled Date</label>
                        <input type="date" value={maintenanceData.scheduledDate ? maintenanceData.scheduledDate.split('T')[0] : ''} onChange={(e) => setMaintenanceData({...maintenanceData, scheduledDate: e.target.value})} style={styles.input} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Service Cost (PKR)</label>
                        <input type="number" value={maintenanceData.cost} onChange={(e) => setMaintenanceData({...maintenanceData, cost: e.target.value})} style={styles.input} placeholder="0.00" />
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Log / Notes</label>
                      <input value={maintenanceData.notes} onChange={(e) => setMaintenanceData({...maintenanceData, notes: e.target.value})} style={styles.input} placeholder="Detail the work performed..." />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setSelectedItem(null)} style={styles.cancelButton}>Cancel</button>
                      <button type="submit" style={{ ...styles.submitButton, boxShadow: '0 12px 20px rgba(13,148,136,0.15)' }}>Update Service Log</button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex items-center justify-center border-2 border-dashed border-[var(--color-border)] rounded-3xl p-12 text-center bg-white/50">
                 <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-[var(--color-surface-soft)] rounded-full flex items-center justify-center mb-6">
                      <Wrench className="text-[var(--color-primary)] opacity-20" size={40} />
                    </div>
                    <h3 className="text-xl font-black text-[var(--color-primary)] uppercase mb-2">Awaiting Selection</h3>
                    <p className="text-sm text-[var(--color-text-light)] max-w-xs mx-auto leading-relaxed font-medium">Please pick an asset from the directory list to schedule maintenance or log a repair task.</p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:     { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title:         { fontSize: '28px', fontWeight: '900', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '-0.5px' },
  error:         { padding: '12px', backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--color-error)' },
  formCard:      { backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '24px', boxShadow: 'var(--color-card-shadow)', marginBottom: '24px', border: '2px solid var(--color-border)' },
  sectionTitle:  { fontSize: '18px', fontWeight: '600', color: 'var(--color-text)', marginBottom: '16px' },
  form:          { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGrid:      { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
  formGroup:     { display: 'flex', flexDirection: 'column', gap: '8px' },
  label:         { fontSize: '14px', fontWeight: '500', color: 'var(--color-text)' },
  input:         { padding: '12px', fontSize: '14px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text)' },
  select:        { padding: '12px', fontSize: '14px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' },
  submitButton:  { padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', alignSelf: 'flex-start' },
  cancelButton:  { padding: '12px 24px', backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text-light)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  tealButton:    { width: '100%', minHeight: '40px', backgroundColor: 'var(--color-primary)', color: 'white', border: '1px solid transparent', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 12px 20px rgba(13,148,136,0.15)' },
  summaryGrid:   { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  summaryCard:   { backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '24px', boxShadow: 'var(--color-card-shadow)', border: '2px solid var(--color-border)' },
  summaryValue:  { fontSize: '32px', fontWeight: '900', color: 'var(--color-primary)', lineHeight: '1' },
  summaryLabel:  { fontSize: '11px', fontWeight: '900', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }
};

const SummaryCard = ({ icon, value, label }) => (
  <div style={styles.summaryCard} className="group hover:border-[var(--color-primary)] transition-colors">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-[var(--color-surface-soft)] rounded-lg group-hover:bg-[var(--color-primary-50)] transition-colors">
        {icon}
      </div>
      <div style={styles.summaryValue}>{value}</div>
    </div>
    <div style={styles.summaryLabel}>{label}</div>
  </div>
);

export default MaintenanceTracker;
