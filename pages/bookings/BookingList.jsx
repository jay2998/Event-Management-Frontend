import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBookings, createBooking, deleteBooking, updateBooking, fetchStats, fetchHalls, notify } from '../../services/api';
import Button from '../../components/ui/Button'; 
import { Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const initialForm = {
  eventName: '',
  eventDate: '',
  eventTime: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  hall: '',
  guestCount: 50,
  package: 'standard',
  notes: '',
};

const BookingList = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [halls, setHalls] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const getUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr || userStr === 'undefined') return {};
      return JSON.parse(userStr);
    } catch { return {}; }
  };
  const user = getUser();
  const isCustomer = user.role === 'customer';

  const [showForm, setShowForm] = useState(isCustomer);
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (!isCustomer) {
      loadStats();
    }
    loadHalls(user);
    loadBookings(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCustomer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = e.target.type === 'number' ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };
  const handleGenerateInvoice = (booking) => {
    navigate(`/bookings/${booking._id}/invoice`);
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch = !searchTerm || 
        booking.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const loadBookings = async (userData = user, silent = false) => {
    try {
      if (!silent) setLoading(true);
      // If customer, only fetch their own bookings (backend should handle this if filtered)
      const params = userData?.role === 'vendor' ? { vendorId: userData._id } : {};
      const response = await fetchBookings(params);
      setBookings(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetchStats();
      const data = response.data?.data || {};
      setStats({
        totalBookings: data.totalBookings ?? data.total ?? 0,
        pendingBookings: data.pendingBookings ?? data.pending ?? 0,
        confirmedBookings: data.confirmedBookings ?? data.confirmed ?? 0,
        completedBookings: data.completedBookings ?? data.completed ?? 0,
      });
    } catch { }
  };

  const loadHalls = async (userData = user) => {
    try {
      const params = userData?.role === 'vendor' ? { vendorId: userData._id } : {};
      const response = await fetchHalls(params);
      setHalls(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load halls', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBooking(id);
        loadBookings();
        loadStats();
      } catch (err) {
        setError('Failed to delete booking');
      }
    }
  };

  const handleEdit = (booking) => {
    setFormData({
      eventName: booking.eventName,
      eventDate: booking.eventDate ? booking.eventDate.split('T')[0] : '',
      eventTime: booking.eventTime || '',
      customerName: booking.customerName,
      customerEmail: booking.customerEmail || '',
      customerPhone: booking.customerPhone,
      hall: booking.hall?._id || booking.hall,
      guestCount: booking.guestCount,
      package: booking.package,
      notes: booking.notes || '',
    });
    setEditingId(booking._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Find the selected hall to get its price for the snapshot
    const selectedHall = halls.find(h => h._id === formData.hall);
    
    // Transform flat form data into the multi-item structure expected by the backend
    const formattedData = {
      ...formData,
      items: [{
        serviceId: formData.hall,
        priceAtBooking: selectedHall ? (selectedHall.pricePerHour || selectedHall.price) : 0,
        slotDate: formData.eventDate,
        slotStartTime: formData.eventTime,
        slotEndTime: formData.eventTime, // Ideally, this would be a separate field or calculated
        quantity: 1
      }],
    };

    try {
      let newBooking;
      if (editingId) {
        const response = await updateBooking(editingId, formattedData);
        newBooking = response.data?.data;
      } else {
        const response = await createBooking(formattedData);
        newBooking = response.data?.data;
      }
      
      setFormData(initialForm);
      setEditingId(null);
      
      notify(editingId ? 'Booking updated successfully!' : 'New booking confirmed!', 'success');
      
      await loadBookings(user, true);
      if (!isCustomer) await loadStats();
    } catch (err) {
      // API errors are now handled globally in api.js
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{isCustomer ? 'Create New Booking' : 'Booking Management'}</h1>
        {!isCustomer && (
          <button onClick={() => {
            if (showForm) { setShowForm(false); setEditingId(null); setFormData(initialForm); }
            else setShowForm(true);
          }} style={styles.addButton}>
            {showForm ? 'View All Bookings' : '+ New Booking'}
          </button>
        )}
      </div>

      {/* Dashboard/Stats Section: Displays booking statistics for non-customer users */}
      {!isCustomer && Object.keys(stats).length > 0 && (
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryValue}>{stats.totalBookings || 0}</div>
            <div style={styles.summaryLabel}>Total Bookings</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryValue}>{stats.pendingBookings || 0}</div>
            <div style={styles.summaryLabel}>Pending</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryValue}>{stats.confirmedBookings || 0}</div>
            <div style={styles.summaryLabel}>Confirmed</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryValue}>{stats.completedBookings || 0}</div>
            <div style={styles.summaryLabel}>Completed</div>
          </div>
        </div>
      )}


      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div style={styles.formCard}>
              <h2 style={styles.sectionTitle}>{editingId ? 'Edit Booking' : 'Event Details'}</h2>
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGrid}>
                   <div style={styles.formGroup}>
                      <label style={styles.label}>Event Name *</label>
                      <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} style={styles.input} placeholder="e.g. Wedding Reception" required />
                   </div>
                   <div style={styles.formGroup}>
                      <label style={styles.label}>Event Date *</label>
                      <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} style={styles.input} required />
                   </div>
                   <div style={styles.formGroup}>
                      <label style={styles.label}>Select Hall *</label>
                      <select name="hall" value={formData.hall} onChange={handleChange} style={styles.select} required>
                        <option value="">Choose Venue</option>
                        {halls.map(hall => <option key={hall._id} value={hall._id}>{hall.name}</option>)}
                      </select>
                   </div>
                   <div style={styles.formGroup}>
                      <label style={styles.label}>Customer Name *</label>
                      <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} style={styles.input} required />
                   </div>
                   <div style={styles.formGroup}>
                      <label style={styles.label}>Phone *</label>
                      <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} style={styles.input} required />
                   </div>
                   <div style={styles.formGroup}>
                      <label style={styles.label}>Email *</label>
                      <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} style={styles.input} required />
                   </div>
                   <div style={styles.formGroup}>
                      <label style={styles.label}>Event Time *</label>
                      <input type="time" name="eventTime" value={formData.eventTime} onChange={handleChange} style={styles.input} required />
                   </div>
                   <div style={styles.formGroup}>
                      <label style={styles.label}>Guests *</label>
                      <input type="number" name="guestCount" value={formData.guestCount} onChange={handleChange} style={styles.input} min="1" required />
                   </div>
                   <div style={styles.formGroup}>
                      <label style={styles.label}>Package *</label>
                      <select name="package" value={formData.package} onChange={handleChange} style={styles.select} required>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                        <option value="luxury">Luxury</option>
                      </select>
                   </div>
                   <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                      <label style={styles.label}>Additional Notes</label>
                      <textarea name="notes" value={formData.notes} onChange={handleChange} style={{ ...styles.input, minHeight: '80px' }} placeholder="Any special requests..." />
                   </div>
                </div>
                {error && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>{error}</p>}
                <button type="submit" style={styles.submitButton} disabled={submitting}>
                  {submitting ? 'Processing...' : editingId ? 'Update Booking' : 'Confirm Booking'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historical table visible for everyone to see updates immediately */}
      <div style={{ marginTop: '20px' }}>
        <div style={styles.filters}>
          <input 
            style={styles.searchInput} 
            placeholder="Search by name or event..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <div style={styles.categoryTabs}>
            {['all', 'pending', 'confirmed', 'completed'].map(status => (
              <button 
                key={status} 
                onClick={() => setStatusFilter(status)} 
                style={statusFilter === status ? {...styles.categoryTab, ...styles.categoryTabActive} : styles.categoryTab}
              >
                {status.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.bookingGrid}>
          {filteredBookings.map((booking) => (
            <div key={booking._id} style={styles.bookingCard}>
              <div className="flex justify-between items-start">
                <span className="text-2xl">📅</span>
                <span style={{ ...styles.badge, ...getStatusStyle(booking.status) }}>
                  {booking.status}
                </span>
              </div>
              <div>
                <h3 style={styles.bookingName}>{booking.eventName}</h3>
                <p style={styles.bookingLead}>{booking.customerName}</p>
                <div style={styles.metaList}>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Client</span>
                    <span style={styles.metaValue}>{booking.customerName}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Date</span>
                    <span style={styles.metaValue}>{new Date(booking.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Venue</span>
                    <span style={styles.metaValue}>{booking.hall?.name || 'TBD'}</span>
                  </div>
                </div>
              </div>
              <div style={styles.actionRow}>
                 <Button
                   variant="primary"
                   size="sm"
                   type="button"
                   className="flex-1 !h-14 rounded-xl font-semibold text-white"
                   style={{ backgroundColor: 'var(--color-primary)', borderColor: 'transparent', color: 'white', padding: '0 0.9rem', fontSize: '15px' }}
                   onClick={() => navigate(`/bookings/${booking._id}`)}
                 >
                   View
                 </Button>
                 {!isCustomer && (
                   <div style={styles.iconGroup}>
                     <button
                       type="button"
                       onClick={() => handleEdit(booking)}
                       style={styles.iconBtn}
                     >
                       <Pencil size={18} />
                     </button>
                     <button
                       type="button"
                       onClick={() => handleDelete(booking._id)}
                       style={styles.dangerIconBtn}
                     >
                       <Trash2 size={18} />
                     </button>
                   </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'confirmed': return { backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' };
    case 'pending': return { backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)' };
    case 'completed': return { backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary)' };
    default: return { backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text)' };
  }
};

const styles = {
  container: {
    padding: '28px',
    maxWidth: '1200px',
    margin: '0 auto'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },

  title: {
    fontSize: '30px',
    fontWeight: '700',
    color: 'var(--color-text)',
    letterSpacing: '-0.4px'
  },

  addButton: {
    padding: '12px 24px',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },

  // FIXED FORM STYLING
  formCard: {
    backgroundColor: 'var(--color-surface)',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: 'var(--color-card-shadow)',
    marginBottom: '24px',
    border: '1px solid var(--color-border)'
  },

  sectionTitle: {
    fontSize: '19px',
    fontWeight: '700',
    color: 'var(--color-text)',
    marginBottom: '16px',
    letterSpacing: '-0.2px'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    rowGap: '32px',
    columnGap: '20px',
    alignItems: 'start'
  },

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: 0
  },

  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--color-text)'
  },

  input: {
    padding: '12px',
    fontSize: '14px',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    backgroundColor: 'var(--color-surface-soft)',
    color: 'var(--color-text)',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none'
  },

  select: {
    padding: '12px',
    fontSize: '14px',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none'
  },

  submitButton: {
    padding: '12px 24px',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    alignSelf: 'flex-start'
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginTop: '32px',
    marginBottom: '24px'
  },

  summaryCard: {
    backgroundColor: 'var(--color-surface)',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: 'var(--color-card-shadow)',
    textAlign: 'center',
    border: '1px solid var(--color-border)'
  },

  summaryValue: {
    fontSize: '26px',
    fontWeight: '800',
    color: 'var(--color-primary)',
    letterSpacing: '-0.3px'
  },

  summaryLabel: {
    fontSize: '13px',
    color: 'var(--color-text-light)',
    marginTop: '4px',
    lineHeight: 1.35
  },

  filters: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px'
  },

  searchInput: {
    padding: '13px 14px',
    borderRadius: '14px',
    border: '1px solid var(--color-border)',
    width: '320px',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)'
  },

  categoryTabs: {
    display: 'flex',
    gap: '10px',
    backgroundColor: 'var(--color-surface-soft)',
    padding: '6px',
    borderRadius: '999px'
  },

  categoryTab: {
    padding: '9px 16px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: 'var(--color-text-light)',
    transition: 'all 0.2s'
  },

  categoryTabActive: {
    backgroundColor: 'white',
    color: 'var(--color-primary)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },

  bookingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px'
  },

  bookingCard: {
    backgroundColor: 'var(--color-surface)',
    padding: '20px',
    borderRadius: '20px',
    boxShadow: 'var(--color-card-shadow)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  badge: {
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase'
  },

  bookingName: {
    fontSize: '19px',
    fontWeight: '800',
    color: 'var(--color-text)',
    marginBottom: '4px',
    lineHeight: 1.2,
    letterSpacing: '-0.2px'
  },

  bookingLead: {
    fontSize: '13px',
    color: 'var(--color-text-light)',
    margin: 0
  },

  metaList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '14px',
    borderRadius: '16px',
    backgroundColor: 'var(--color-surface-soft)',
    border: '1px solid var(--color-border)'
  },

  metaItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px'
  },

  metaLabel: {
    fontSize: '11px',
    fontWeight: '800',
    color: 'var(--color-text-light)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  },

  metaValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-text)',
    textAlign: 'right'
  },

  actionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '2px'
  },

  iconGroup: {
    display: 'flex',
    gap: '8px'
  },

  iconBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    border: '1px solid var(--color-primary-100)',
    backgroundColor: 'var(--color-primary-50)',
    color: 'var(--color-primary)'
  },

  dangerIconBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    border: '1px solid var(--color-error)',
    backgroundColor: 'var(--color-error-light)',
    color: 'var(--color-error)'
  }
};

export default BookingList;
