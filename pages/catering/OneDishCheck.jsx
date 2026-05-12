import React, { useState, useEffect } from 'react';
import { fetchCateringOrders, updateCateringOrder } from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ClipboardCheck, 
  Utensils, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ListChecks, 
  Activity,
  ChevronRight,
  Eye
} from 'lucide-react';

const OneDishCheck = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [checkData, setCheckData] = useState({
    appearance: 'pending',
    taste: 'pending',
    temperature: 'pending',
    plating: 'pending',
    notes: ''
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetchCateringOrders();
      setOrders(response.data?.data || []);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setError('');
    setCheckData({
      appearance: order.qualityCheck?.appearance || 'pending',
      taste: order.qualityCheck?.taste || 'pending',
      temperature: order.qualityCheck?.temperature || 'pending',
      plating: order.qualityCheck?.plating || 'pending',
      notes: order.qualityCheck?.notes || ''
    });
  };

  const handleSubmitCheck = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const hasFailedMetric = Object.entries(checkData).some(
      ([key, value]) => key !== 'notes' && value === 'failed'
    );

    if (hasFailedMetric && !checkData.notes.trim()) {
      setError('Notes are mandatory when any quality metric is marked as Failed');
      return;
    }

    try {
      const complianceFailed = hasFailedMetric;
      const updateData = {
        qualityCheck: checkData,
        status: 'Inspected'
      };

      await updateCateringOrder(selectedOrder._id, updateData);

      if (complianceFailed) {
        const qualityAlert = {
          id: Date.now(),
          type: 'quality_failure',
          orderId: selectedOrder._id,
          eventDate: selectedOrder.eventDate,
          severity: 'high',
          message: `Quality failure detected for order #${selectedOrder._id.slice(-6)}`,
          failedMetrics: Object.entries(checkData)
            .filter(([key, value]) => key !== 'notes' && value === 'failed')
            .map(([key]) => key),
          notes: checkData.notes,
          timestamp: new Date().toISOString(),
          read: false
        };

        const existingAlerts = JSON.parse(localStorage.getItem('qualityAlerts') || '[]');
        existingAlerts.push(qualityAlert);
        localStorage.setItem('qualityAlerts', JSON.stringify(existingAlerts));

        window.dispatchEvent(
          new CustomEvent('qualityAlertAdded', { detail: qualityAlert })
        );
      }

      loadOrders();
      setSelectedOrder(null);
      setError('');
      alert('Quality check submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quality check');
    }
  };

  const getBadgeStyle = (status) => {
    // Using CSS variables for consistency with the theme
    if (status === 'Inspected') return 'bg-[var(--color-primary-50)] text-[var(--color-primary-dark)] border-[var(--color-primary-100)]';
    if (status === 'Pending') return 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning)]';
    return 'bg-[var(--color-surface-soft)] text-[var(--color-text-light)] border-[var(--color-border)]';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div className="flex items-center gap-3 justify-center">
          <div className="p-2 bg-[var(--color-primary-50)] rounded-xl">
            <ShieldCheck className="text-[var(--color-primary)]" size={24} />
          </div>
          <h1 style={styles.title}>Quality Assurance</h1>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.summaryGrid}>
        <SummaryCard icon={<Activity className="text-[var(--color-primary)]" size={20} />} value={orders.length} label="Live Orders" />
        <SummaryCard icon={<CheckCircle2 className="text-[var(--color-primary)]" size={20} />} value={orders.filter(o => o.status === 'Inspected').length} label="Checks Done" />
        <SummaryCard icon={<ListChecks className="text-[var(--color-primary)]" size={20} />} value="100%" label="Audit Score" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: '32px', marginTop: '40px', maxWidth: '1600px', margin: '40px auto 0', width: '100%', padding: '0 24px', alignItems: 'flex-start', justifyContent: 'center' }}>
        {/* Order List */}
        <div style={{ ...styles.liveOrdersPanel, flex: '0 0 350px', minWidth: '350px', width: '350px' }}>
          <div className="flex flex-col items-center justify-center gap-2 text-center mb-2">
            <h2 className="text-base font-black uppercase tracking-[0.15em] text-[var(--color-primary-dark)]">Live Orders</h2>
            <span className="rounded-full border border-[var(--color-primary-100)] bg-white px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--color-primary)] shadow-sm">
              Select one
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto', paddingRight: '8px', alignItems: 'center' }}>
            {loading ? (
              <div className="text-center py-10 opacity-50">Syncing orders...</div>
            ) : (
              orders.map(order => (
                <div 
                  key={order._id} 
                  onClick={() => handleSelectOrder(order)} 
                  className={`group relative overflow-hidden p-4 sm:p-5 rounded-[22px] border-2 transition-all cursor-pointer shadow-sm w-full max-w-xs ${selectedOrder?._id === order._id ? 'border-[var(--color-primary)] bg-[var(--color-primary-50)] shadow-[0_12px_24px_rgba(13,148,136,0.10)]' : 'border-[var(--color-primary-100)] bg-white hover:border-[var(--color-primary)] hover:shadow-[0_10px_22px_rgba(15,118,110,0.08)]'}`}
                >
                  <div className={`absolute left-0 top-0 h-full w-1.5 transition-colors ${selectedOrder?._id === order._id ? 'bg-[var(--color-primary)]' : 'bg-transparent group-hover:bg-[var(--color-primary-50)]'}`} />
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--color-text-light)]">Live Order</div>
                      <span className="block text-[15px] sm:text-base font-black text-[var(--color-text)] tracking-tight leading-tight">#{order._id.slice(-6)}</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border whitespace-nowrap shadow-sm ${getBadgeStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold text-[var(--color-text-light)] uppercase tracking-wider">
                    <span className="flex items-center justify-center gap-1.5 rounded-full bg-[var(--color-surface-soft)] px-2.5 py-1.5 text-center">
                      <Clock size={10} /> {order.eventDate ? new Date(order.eventDate).toLocaleDateString() : 'No date'}
                    </span>
                    <span className="flex items-center justify-center gap-1.5 rounded-full bg-[var(--color-surface-soft)] px-2.5 py-1.5 text-center">
                      <Utensils size={10} /> {order.items?.length || 0} items
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOrder(order);
                    }}
                    style={styles.inspectButton}
                    aria-label={`Inspect order ${order._id.slice(-6)}`}
                  >
                    <Eye size={12} />
                    Inspect
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Assessment Form */}
        <div style={{ marginLeft: '32px', flex: '0 1 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 0 }}>
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', justifyContent: 'center', maxWidth: '100%' }}>
                <div style={{...styles.assessmentShell, maxWidth: '850px', flex: 'none' }}>
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary-100)] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-primary-dark)] shadow-sm">
              Quality Assessment
            </div>
          </div>
                  <form onSubmit={handleSubmitCheck} className="flex flex-col items-center justify-center space-y-5 w-full text-center">
                    <div className="p-8 bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-surface-soft)] rounded-3xl border border-[var(--color-primary-100)] flex flex-col items-center text-center gap-4 w-full max-w-xl mx-auto shadow-md">
                      <div className="space-y-2 w-full text-center">
                        <div className="text-[9px] font-black uppercase text-[var(--color-primary)] tracking-[0.35em] opacity-75">Inspecting Order</div>
                        <div className="text-2xl font-black text-[var(--color-text)] leading-tight tracking-tight">ID: {selectedOrder._id.slice(-6)}</div>
                        <div className="text-[12px] font-medium text-[var(--color-text-light)] max-w-xl mx-auto leading-relaxed">
                          Review the live catering order and record each quality signal below.
                        </div>
                        <div className="flex justify-center">
                          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--color-primary-dark)] border border-[var(--color-primary-100)] shadow-sm">
                            {selectedOrder.status}
                          </div>
                        </div>
                      </div>
                      <button type="button" onClick={() => setSelectedOrder(null)} style={styles.closeButton}>
                        Close
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full max-w-xl mx-auto">
                      {['appearance', 'taste', 'temperature', 'plating'].map((field) => (
                        <div key={field} className="space-y-2 rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-white to-[var(--color-surface-soft)] p-4 shadow-sm hover:shadow-md transition-shadow text-center">
                          <label className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--color-text)] block">
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                          </label>
                          <div className="flex flex-wrap justify-center gap-2">
                            {['passed', 'failed'].map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => setCheckData({ ...checkData, [field]: status })}
                                style={{
                                  ...styles.optionButton,
                                  ...(checkData[field] === status
                                    ? (status === 'passed' ? styles.optionButtonPassed : styles.optionButtonFailed)
                                  : styles.optionButtonIdle)
                                }}
                              >
                                {status === 'passed' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2.5 w-full max-w-xl mx-auto pt-1 text-center">
                      <label className="text-[10px] font-black uppercase text-[var(--color-text)] ml-1 block text-center tracking-[0.12em]">
                        Inspection Notes {Object.values(checkData).includes('failed') && <span className="text-[var(--color-error)]">* REQUIRED</span>}
                      </label>
                      <textarea 
                        className="w-full px-5 py-3 rounded-2xl border border-[var(--color-border)] bg-white text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary-100)] focus:border-[var(--color-primary)] outline-none transition-all resize-none shadow-sm hover:shadow-md" 
                        value={checkData.notes} 
                        onChange={(e) => setCheckData({ ...checkData, notes: e.target.value })} 
                        rows="4" 
                        placeholder="Log detailed quality observations..." 
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2 w-full max-w-xl mx-auto">
                      <button type="button" onClick={() => setSelectedOrder(null)} style={styles.cancelButton}>
                        Cancel
                      </button>
                      <button type="submit" style={styles.submitButton}>
                        Submit Assessment
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--color-border)', borderRadius: '24px', padding: '48px 24px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.5)' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '400px' }}>
                    <div style={{ width: '96px', height: '96px', backgroundColor: 'var(--color-surface-soft)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                      <ClipboardCheck className="text-[var(--color-primary)] opacity-20" size={48} />
                    </div>
                    <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '12px' }}>Ready for Inspection</h3>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-light)', lineHeight: 1.6, fontWeight: 500 }}>Select a live catering order from the registry to perform a professional quality assessment.</p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
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

const styles = {
  container: { padding: '32px 24px', maxWidth: '1600px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '32px', textAlign: 'center' },
  title: { fontSize: '28px', fontWeight: '900', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '-0.5px' },
  error: { padding: '12px', backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--color-error)' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', maxWidth: '800px', margin: '0 auto', padding: '0 24px' },
  summaryCard: { backgroundColor: 'var(--color-surface)', padding: '24px 20px', borderRadius: '20px', boxShadow: 'var(--color-card-shadow)', border: '2px solid var(--color-border)' },
  summaryValue: { fontSize: '28px', fontWeight: '900', color: 'var(--color-primary)', lineHeight: '1' },
  summaryLabel: { fontSize: '10px', fontWeight: '900', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' },
  liveOrdersPanel: {
    background: 'linear-gradient(180deg, #d6fbf4 0%, #f7fffd 100%)',
    border: '2px solid #9be2d6',
    borderRadius: '28px',
    padding: '24px',
    boxShadow: '0 18px 42px rgba(13,148,136,0.14)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    height: 'fit-content',
    minHeight: 'auto',
    flexShrink: 0
  },
  inspectButton: {
    marginTop: '12px',
    width: 'fit-content',
    alignSelf: 'center',
    // ... (rest of the styles remain unchanged)
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '999px',
    border: '1px solid var(--color-primary)',
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
    color: 'white',
    padding: '8px 12px',
    fontSize: '9px',
    fontWeight: '900',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    gap: '6px',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(13,148,136,0.18)',
    transition: 'all 0.2s ease'
  },
  assessmentShell: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f9fffe 100%)',
    border: '1px solid #e0f0ed',
    borderRadius: '32px',
    padding: '40px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.05)',
    width: '100%',
    maxWidth: '100%',
    flex: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: { padding: '6px 12px', borderRadius: '999px', border: '1px solid var(--color-primary-100)', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-dark)', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  optionButton: { width: 'auto', minWidth: '84px', minHeight: '38px', padding: '8px 10px', borderRadius: '999px', border: '1px solid var(--color-border)', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: 'pointer', transition: 'all 0.2s ease', lineHeight: '1' },
  optionButtonIdle: { backgroundColor: 'var(--color-surface)', color: 'var(--color-text-light)', borderColor: 'var(--color-border)' },
  optionButtonPassed: { backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-dark)', borderColor: 'var(--color-primary-100)' },
  optionButtonFailed: { backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)', borderColor: 'var(--color-error)' },
  cancelButton: { padding: '10px 16px', borderRadius: '14px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '13px', fontWeight: '700', minWidth: '110px' },
  submitButton: { padding: '12px 24px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '800', boxShadow: '0 12px 28px rgba(13,148,136,0.22)', minWidth: '150px', transition: 'all 0.3s ease', letterSpacing: '0.04em' }
};

export default OneDishCheck;