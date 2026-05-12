import React, { useState, useEffect } from 'react';
import { fetchRentals, updateRental } from '../../services/api';
import Card from '../../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, // For header title
  Boxes, // For asset directory
  TriangleAlert, // For damage indicator and empty state
  Wrench, // For estimated cost/recovery
  Activity, // For live orders summary
  CheckCircle2, // For checks done summary
  ListChecks, // For audit score summary
  DollarSign // For estimated cost
} from 'lucide-react';

const DamageReport = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [reportData, setReportData] = useState({ damageType: '', description: '', severity: 'minor', estimatedCost: '', photos: [] });

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
      setReportData({ damageType: '', description: '', severity: 'minor', estimatedCost: '', photos: [] });
      return;
    }

    setSelectedItem(item);
    setReportData({
      damageType: item.damageReport?.damageType || '',
      description: item.damageReport?.description || '',
      severity: item.damageReport?.severity || 'minor',
      estimatedCost: item.damageReport?.estimatedCost || '',
      photos: item.damageReport?.photos || []
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await updateRental(selectedItem._id, { damageReport: reportData });
      loadRentals();
      setSelectedItem(null);
      alert('Damage report submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    }
  };

  const getSeverityBadgeStyle = (severity) => {
    if (severity === 'severe') return 'bg-[var(--color-error-light)] text-[var(--color-error)] border-[var(--color-error)]';
    if (severity === 'moderate') return 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning)]';
    if (severity === 'minor') return 'bg-[var(--color-primary-50)] text-[var(--color-primary)] border-[var(--color-primary-100)]';
    return 'bg-[var(--color-surface-soft)] text-[var(--color-text-light)] border-[var(--color-border)]';
  };

  const itemsWithDamage = rentals.filter(r => r.damageReport);

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'minor':    return { bg: 'var(--color-primary-50)', text: 'var(--color-primary)' };
      case 'moderate': return { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' };
      case 'severe':   return { bg: 'var(--color-error-light)', text: 'var(--color-error)' };
      default:         return { bg: 'var(--color-surface-soft)', text: 'var(--color-text-light)' };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--color-primary-50)] rounded-xl">
            <ShieldAlert className="text-[var(--color-primary)]" size={24} />
          </div>
          <h1 style={styles.title}>Incident Reporting</h1>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.summaryGrid} className="mb-8">
        <SummaryCard icon={<Activity className="text-teal-500" size={20} />} value={itemsWithDamage.length} label="Items at Risk" />
        <SummaryCard icon={<TriangleAlert className="text-[var(--color-error)]" size={20} />} value={itemsWithDamage.filter(i => i.damageReport?.severity === 'severe').length} label="Severe Cases" />
        <SummaryCard icon={<DollarSign className="text-emerald-500" size={20} />} value={`PKR ${itemsWithDamage.reduce((sum, i) => sum + (Number(i.damageReport?.estimatedCost) || 0), 0).toLocaleString()}`} label="Est. Recovery" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Items List */}
        <div className="lg:col-span-1">
          <Card title={<div className="space-y-1"><div className="text-lg font-semibold text-[var(--color-text)]">Asset Directory</div><div className="text-sm text-[var(--color-text-light)]">Click an asset to begin incident assessment.</div></div>} className="h-full shadow-lg">
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div style={styles.loading}>Syncing data...</div>
              ) : (
                rentals.map(item => (
                  <div 
                    key={item._id} 
                    className={`p-5 rounded-2xl border-2 transition-all shadow-sm ${selectedItem?._id === item._id ? 'border-[var(--color-primary)] bg-[var(--color-primary-50)]' : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary-100)]'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-black text-[var(--color-text)] uppercase">{item.name}</span>
                      {item.damageReport && <TriangleAlert size={16} className="text-[var(--color-error)]" />}
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-[var(--color-text-light)] uppercase tracking-wider mb-4">
                      <span>{item.category}</span>
                      <span>{item.quantity} {item.unit}</span>
                    </div>
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleSelect(item)}
                        style={styles.tealButton}
                      >
                        {selectedItem?._id === item._id ? 'Close Assessment' : 'Open Assessment'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Report Form */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card title="Incident Assessment">
                    <div className="p-5 bg-[var(--color-surface-soft)] rounded-2xl border border-[var(--color-border)] mb-4">
                      <div className="text-[10px] font-black uppercase text-[var(--color-primary)] mb-1">Reporting for</div>
                      <div className="text-lg font-black text-[var(--color-text)]">{selectedItem.name}</div>
                    </div>
                  <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Damage Category *</label>
                        <select value={reportData.damageType} onChange={(e) => setReportData({...reportData, damageType: e.target.value})} style={styles.select} required>
                        <option value="">Select type</option>
                        <option value="broken">Broken / Non-functional</option>
                        <option value="scratched">Scratched / Aesthetic</option>
                        <option value="stained">Stained / Dirty</option>
                        <option value="missing">Missing Components</option>
                        <option value="wear">General Wear & Tear</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Incident Severity</label>
                        {/* Using Tailwind classes for badge-like appearance */}
                        <select value={reportData.severity} onChange={(e) => setReportData({...reportData, severity: e.target.value})} style={styles.select}>
                        <option value="minor">Minor (Functional)</option>
                        <option value="moderate">Moderate (Needs Repair)</option>
                        <option value="severe">Severe (Replacement Required)</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Estimated Cost (PKR)</label>
                        <input type="number" value={reportData.estimatedCost} onChange={(e) => setReportData({...reportData, estimatedCost: e.target.value})} style={styles.input} placeholder="0.00" />
                      </div>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Incident Description</label>
                      <input value={reportData.description} onChange={(e) => setReportData({...reportData, description: e.target.value})} style={styles.input} required placeholder="Detail the circumstances..." />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setSelectedItem(null)} style={styles.cancelButton}>Cancel</button>
                      <button type="submit" style={{ ...styles.submitButton, boxShadow: '0 12px 20px rgba(13,148,136,0.15)' }}>Submit Report</button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex items-center justify-center border-2 border-dashed border-[var(--color-border)] rounded-3xl p-12 text-center bg-white/50">
                 <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-[var(--color-surface-soft)] rounded-full flex items-center justify-center mb-6">
                      <TriangleAlert className="text-[var(--color-primary)] opacity-20" size={40} />
                    </div>
                    <h3 className="text-xl font-black text-[var(--color-primary)] uppercase mb-2">Awaiting Selection</h3>
                    <p className="text-sm text-[var(--color-text-light)] max-w-xs mx-auto leading-relaxed font-medium">Please pick an asset from the inventory list to report a new damage incident or update an existing one.</p>
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
  formCard:      { backgroundColor: 'var(--color-surface)', padding: '20px', borderRadius: '12px', boxShadow: 'var(--color-card-shadow)', marginBottom: '24px', border: '1px solid var(--color-border)' },
  sectionTitle:  { fontSize: '18px', fontWeight: '600', color: 'var(--color-text)', marginBottom: '16px' },
  form:          { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGrid:      { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  formGroup:     { display: 'flex', flexDirection: 'column', gap: '8px' },
  label:         { fontSize: '14px', fontWeight: '500', color: 'var(--color-text)' },
  input:         { padding: '12px', fontSize: '14px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text)' },
  select:        { padding: '12px', fontSize: '14px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' },
  submitButton:  { padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', alignSelf: 'flex-start' },
  cancelButton:  { padding: '12px 24px', backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text-light)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  tealButton:    { width: '100%', minHeight: '40px', backgroundColor: 'var(--color-primary)', color: 'white', border: '1px solid transparent', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 12px 20px rgba(13,148,136,0.15)' },
  loading:       { textAlign: 'center', padding: '40px', color: 'var(--color-text-light)' },
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

export default DamageReport;
