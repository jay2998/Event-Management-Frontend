import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchHalls, createHall, deleteHall, updateHall } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
const cities = ['All Cities', 'Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan'];
const HallList = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('All Cities');
  
  const [editingId, setEditingId] = useState(null);
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch { return {}; }
  };
  const user = getUser();
  const isCustomer = user.role === 'customer';

  const [showForm, setShowForm] = useState(false);
  const [newHallData, setNewHallData] = useState({
    name: '',
    description: '',
    city: 'Lahore',
    address: '',
    capacity: '',
    pricePerHour: '',
    images: '',
    amenities: ''
  });

  useEffect(() => {
    loadHalls();
  }, [cityFilter]);

  const loadHalls = async () => {
    try {
      setLoading(true);
      const params = {
        city: cityFilter !== 'All Cities' ? cityFilter : undefined,
        ...(user?.role === 'vendor' && { vendorId: user._id })
      };
      const response = await fetchHalls(params);
      setHalls(response.data?.data || []);
    } catch (err) {
      setError('Failed to load halls');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (hallId) => {
    if (window.confirm('Delete this hall?')) {
      try {
        await deleteHall(hallId);
        loadHalls();
      } catch (err) {
        setError('Delete failed');
      }
    }
  };

  const handleEdit = (hall) => {
    setEditingId(hall._id);
    setNewHallData({
      name: hall.name,
      description: hall.description || '',
      city: hall.city,
      address: hall.address,
      capacity: hall.capacity,
      pricePerHour: hall.pricePerHour,
      images: hall.images ? hall.images.join(', ') : '',
      amenities: hall.amenities ? hall.amenities.join(', ') : ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setNewHallData({ 
      name: '', 
      description: '', 
      city: 'Lahore', 
      address: '', 
      capacity: '', 
      pricePerHour: '', 
      images: '', 
      amenities: '' 
    });
    setShowForm(false);
  };

  const filteredHalls = halls.filter(hall =>
    hall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hall.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getHallImage = (hall) => {
    if (Array.isArray(hall.images) && hall.images.length) return hall.images[0];
    if (typeof hall.images === 'string') return hall.images.split(',')[0]?.trim();
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const dataToSubmit = {
        ...newHallData,
        images: typeof newHallData.images === 'string' ? newHallData.images.split(',').map(s => s.trim()).filter(Boolean) : newHallData.images,
        amenities: typeof newHallData.amenities === 'string' ? newHallData.amenities.split(',').map(s => s.trim()).filter(Boolean) : newHallData.amenities
      };

      if (editingId) {
        await updateHall(editingId, dataToSubmit);
      } else {
        await createHall(dataToSubmit);
      }
      resetForm();
      loadHalls();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add hall');
    }
  };

  return (
    <div style={styles.container}>
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 style={styles.title}>{isCustomer ? 'Explore Venues' : 'Venue Management'}</h1>
        {!isCustomer && (
          <button onClick={() => { if(showForm) resetForm(); else setShowForm(true); }} style={styles.addButton}>
            {showForm ? 'Cancel' : '+ Add New Venue'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && !isCustomer && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div style={styles.formCard} className="!p-4 sm:!p-6">
               <h2 style={styles.sectionTitle}>{editingId ? 'Update Venue Details' : 'Register New Venue'}</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                   <div style={styles.formGrid} className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Hall Name *</label>
                      <input type="text" value={newHallData.name} onChange={(e) => setNewHallData({...newHallData, name: e.target.value})} style={styles.input} placeholder="e.g. Royal Grand Ballroom" required />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>City *</label>
                      <select value={newHallData.city} onChange={(e) => setNewHallData({...newHallData, city: e.target.value})} style={styles.select} required>
                        {cities.slice(1).map(city => <option key={city} value={city}>{city}</option>)}
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Capacity (Guests) *</label>
                      <input type="number" value={newHallData.capacity} onChange={(e) => setNewHallData({...newHallData, capacity: e.target.value})} style={styles.input} placeholder="500" required />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Price Per Hour (PKR) *</label>
                      <input type="number" value={newHallData.pricePerHour} onChange={(e) => setNewHallData({...newHallData, pricePerHour: e.target.value})} style={styles.input} placeholder="15000" required />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Full Address *</label>
                      <input type="text" value={newHallData.address} onChange={(e) => setNewHallData({...newHallData, address: e.target.value})} style={styles.input} placeholder="Main Boulevard, Gulberg III" required />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Description</label>
                      <input type="text" value={newHallData.description} onChange={(e) => setNewHallData({...newHallData, description: e.target.value})} style={styles.input} placeholder="A short description..." />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Image URLs (comma separated)</label>
                      <input type="text" value={newHallData.images} onChange={(e) => setNewHallData({...newHallData, images: e.target.value})} style={styles.input} placeholder="url1, url2..." />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Amenities (comma separated)</label>
                      <input type="text" value={newHallData.amenities} onChange={(e) => setNewHallData({...newHallData, amenities: e.target.value})} style={styles.input} placeholder="AC, Parking, WiFi..." />
                    </div>
                  </div>
                   <div className="flex flex-col sm:flex-row gap-3 mt-2">
                      <button type="submit" style={styles.submitButton}>{editingId ? 'Update Venue' : 'Save Venue'}</button>
                      <button type="button" onClick={resetForm} style={styles.cancelButton}>Cancel</button>
                   </div>
               </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="mb-6">
        <div style={styles.filters} className="gap-3 sm:gap-4">
           <div className="flex-1 min-w-0">
             <input
               style={styles.searchInput}
               type="text"
               placeholder="Search venues..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <div style={styles.categoryTabs} className="flex-wrap">
             {cities.map(city => (
               <button key={city} onClick={() => setCityFilter(city)} style={cityFilter === city ? {...styles.categoryTab, ...styles.categoryTabActive} : styles.categoryTab}>
                 {city}
               </button>
             ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div style={styles.itemGrid} className="grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {filteredHalls.map((hall) => (
              <motion.div key={hall._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="group !p-0 h-full">
                  <div className="overflow-hidden rounded-2xl flex flex-col h-full">
                    <div className="relative h-44 sm:h-52 bg-[var(--color-surface-soft)] overflow-hidden">
                      {getHallImage(hall) ? (
                      <img
                        src={getHallImage(hall)}
                        alt={hall.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
                      🏛️
                    </div>
                  )}

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[11px] font-bold shadow-lg text-[var(--color-text)]">
                    {hall.city}
                  </div>
                </div>

                <div className="p-4 sm:p-6 flex-1 flex flex-col gap-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-black text-[var(--color-text)] tracking-tight line-clamp-1">
                        {hall.name}
                      </h3>

                      <p className="text-sm text-[var(--color-text-light)] mt-1 line-clamp-2">
                        {hall.description || 'Luxury wedding venue with premium facilities and elegant atmosphere.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[var(--color-surface-soft)] rounded-xl p-3 border border-[var(--color-border)]">
                      <div className="text-xs font-semibold text-[var(--color-text-light)] mb-1">
                        Capacity
                      </div>

                      <div className="flex items-center gap-2 font-bold text-[var(--color-text)]">
                        <span>👥</span>
                        {hall.capacity} Guests
                      </div>
                    </div>

                    <div className="bg-[var(--color-surface-soft)] rounded-xl p-3 border border-[var(--color-border)]">
                      <div className="text-xs font-semibold text-[var(--color-text-light)] mb-1">
                        Location
                      </div>

                      <div className="flex items-center gap-2 font-bold text-[var(--color-text)] line-clamp-1">
                        <span>📍</span>
                        {hall.address?.split(',')[0]}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-light)]">
                        Starting From
                      </span>

                      <div className="flex items-end gap-1 mt-1">
                        <span className="text-xl font-black text-[var(--color-primary)]">
                          PKR {hall.pricePerHour?.toLocaleString()}
                        </span>

                        <span className="text-sm font-medium text-[var(--color-text-light)] mb-[2px]">
                          /hr
                        </span>
                      </div>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)] text-[11px] font-bold uppercase tracking-wide w-fit">
                      Premium Venue
                    </div>
                  </div>
                </div>

                  <div className="mt-auto flex flex-col sm:flex-row gap-3 justify-end pt-4">
                    {isCustomer ? (
                      <Button
                        size="sm"
                        as="link"
                        to={`/bookings?hall=${hall._id}`}
                        className="w-full sm:w-auto !h-11 rounded-xl shadow-md shadow-teal-100 font-semibold"
                      >
                        Book Venue
                      </Button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEdit(hall)}
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
                          onClick={() => handleDelete(hall._id)}
                          style={{
                            ...styles.iconBtn,
                            backgroundColor: 'var(--color-error-light)',
                            color: 'var(--color-error)',
                            border: '1px solid var(--color-error)'
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      </Card>

      <Card>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryValue}>{halls.length}</div>
            <div style={styles.summaryLabel}>Total Venues</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryValue}>{halls.filter(h => h.city === 'Lahore').length}</div>
            <div style={styles.summaryLabel}>Lahore Properties</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryValue}>PKR {halls.length > 0 ? Math.min(...halls.map(h => h.pricePerHour || 0)).toLocaleString() : '0'}</div>
            <div style={styles.summaryLabel}>Lowest Rate</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const styles = {
  container: { padding: '28px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '30px', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '-0.4px' },
  addButton: { padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  formCard: { backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--color-card-shadow)', marginBottom: '24px', border: '1px solid rgba(13,148,136,0.14)' },
  sectionTitle: { fontSize: '19px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '16px', letterSpacing: '-0.2px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
   formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' },
  input: { padding: '12px 14px', fontSize: '14px', border: '1px solid var(--color-border)', borderRadius: '12px', backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text)' },
  select: { padding: '12px 14px', fontSize: '14px', border: '1px solid var(--color-border)', borderRadius: '12px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' },
  submitButton: { padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  cancelButton: { padding: '12px 24px', backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '12px', cursor: 'pointer' },
  filters: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' },
  searchInput: { padding: '13px 14px', border: '1px solid var(--color-border)', borderRadius: '14px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', width: '100%', maxWidth: '420px' },
  categoryTabs: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' },
  categoryTab: { padding: '9px 16px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text)', whiteSpace: 'nowrap' },
  categoryTabActive: { backgroundColor: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' },
   itemGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '32px' },
   summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  summaryCard: { backgroundColor: 'var(--color-surface)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--color-card-shadow)', textAlign: 'center', border: '1px solid rgba(13,148,136,0.14)' },
  summaryValue: { fontSize: '30px', fontWeight: '700', color: 'var(--color-primary-dark)', letterSpacing: '-0.4px' },
  iconBtn: { width: '40px', height: '40px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, transition: 'all 0.2s', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' },
  summaryLabel: { fontSize: '14px', color: 'var(--color-text-light)', marginTop: '4px', lineHeight: 1.35 }
};

export default HallList;
