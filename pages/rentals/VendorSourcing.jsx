import React, { useState, useEffect } from 'react';
import { fetchRentals, createRental, updateRental } from '../../services/api';

const VendorSourcing = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [vendors, setVendors] = useState([
    { id: 1, vendorName: 'EventPro Supply Co', category: 'equipment', rating: 4.5, contact: 'info@eventpro.com', phone: '555-0101' },
    { id: 2, vendorName: 'Furniture Plus', category: 'furniture', rating: 4.2, contact: 'sales@furnitureplus.com', phone: '555-0102' },
    { id: 3, vendorName: 'LightSound Productions', category: 'lighting', rating: 4.8, contact: 'book@lightsound.com', phone: '555-0103' },
    { id: 4, vendorName: 'Audio Masters', category: 'audio', rating: 4.6, contact: 'rentals@audiomasters.com', phone: '555-0104' },
    { id: 5, vendorName: 'Decor Dreams', category: 'decor', rating: 4.3, contact: 'hello@decordreams.com', phone: '555-0105' }
  ]);
  const [formData, setFormData] = useState({ vendorName: '', vendorEmail: '', vendorPhone: '', category: 'equipment', notes: '' });

  useEffect(() => {
    loadRentals();
    loadLocalVendors();
  }, []);

  const loadRentals = async () => {
    try {
      const response = await fetchRentals();
      setRentals(response.data?.data || []);
    } catch (err) {
      // Use local data
    } finally {
      setLoading(false);
    }
  };

  const loadLocalVendors = () => {
    try {
      const saved = localStorage.getItem('vendors');
      if (saved) {
        setVendors(JSON.parse(saved));
      }
    } catch {
      // Fall back to the in-memory seed list if stored data is invalid.
    }
  };

  const handleAddVendor = (e) => {
    e.preventDefault();
    const newVendor = {
      id: Date.now(),
      vendorName: formData.vendorName,
      category: formData.category,
      rating: 0,
      contact: formData.vendorEmail,
      phone: formData.vendorPhone,
      notes: formData.notes,
    };
    const updatedVendors = [...vendors, newVendor];
    setVendors(updatedVendors);
    localStorage.setItem('vendors', JSON.stringify(updatedVendors));
    setShowForm(false);
    setFormData({ vendorName: '', vendorEmail: '', vendorPhone: '', category: 'equipment', notes: '' });
  };

  const handleDeleteVendor = (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      const updatedVendors = vendors.filter(v => v.id !== vendorId);
      setVendors(updatedVendors);
      localStorage.setItem('vendors', JSON.stringify(updatedVendors));
    }
  };

  const handleContact = (vendor) => {
    const email = vendor.contact || vendor.vendorEmail;
    if (!email) return;
    window.open(`mailto:${email}?subject=Vendor Inquiry`);
  };

  const categories = ['all', 'equipment', 'furniture', 'decor', 'lighting', 'audio'];
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredVendors = vendors.filter(v => categoryFilter === 'all' || v.category === categoryFilter);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Vendor Sourcing</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>
          {showForm ? 'Cancel' : '+ Add Vendor'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.sectionTitle}>Add New Vendor</h2>
          <form onSubmit={handleAddVendor} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Vendor Name *</label>
                <input type="text" value={formData.vendorName} onChange={(e) => setFormData({...formData, vendorName: e.target.value})} style={styles.input} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input type="email" value={formData.vendorEmail} onChange={(e) => setFormData({...formData, vendorEmail: e.target.value})} style={styles.input} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input type="tel" value={formData.vendorPhone} onChange={(e) => setFormData({...formData, vendorPhone: e.target.value})} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category *</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={styles.select}>
                  <option value="equipment">Equipment</option>
                  <option value="furniture">Furniture</option>
                  <option value="decor">Decor</option>
                  <option value="lighting">Lighting</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <input type="text" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} style={styles.input} />
              </div>
            </div>
            <button type="submit" style={styles.submitButton}>Add Vendor</button>
          </form>
        </div>
      )}

      {/* Category Tabs */}
      <div style={styles.categoryTabs}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)} style={categoryFilter === cat ? {...styles.categoryTab, ...styles.categoryTabActive} : styles.categoryTab}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Vendor Cards */}
      {loading ? (
        <div style={styles.loading}>Loading vendors...</div>
      ) : (
        <div style={styles.vendorGrid}>
          {filteredVendors.length > 0 ? filteredVendors.map(vendor => (
            <div key={vendor.id} style={styles.vendorCard}>
              <div style={styles.vendorHeader}>
                <span style={styles.vendorIcon}>🏢</span>
                <span style={styles.categoryBadge}>{vendor.category}</span>
              </div>
              <h3 style={styles.vendorName}>{vendor.vendorName}</h3>
              <div style={styles.vendorInfo}>
                <span>{vendor.phone || vendor.vendorPhone || 'No phone'}</span>
                <span>{vendor.contact || vendor.vendorEmail || 'No email'}</span>
              </div>
              <div style={styles.rating}>
                {'★'.repeat(Math.floor(vendor.rating))}
                {'☆'.repeat(5 - Math.floor(vendor.rating))}
                <span style={styles.ratingValue}>{vendor.rating}</span>
              </div>
              <div style={styles.vendorActions}>
                <button onClick={() => handleContact(vendor)} style={styles.contactButton}>Contact</button>
                <button onClick={() => handleDeleteVendor(vendor.id)} style={styles.deleteButton}>Delete</button>
              </div>
            </div>
          )) : (
            <div style={styles.noData}>No vendors found for this category</div>
          )}
        </div>
      )}

      {/* Summary */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{vendors.length}</div>
          <div style={styles.summaryLabel}>Total Vendors</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{vendors.filter(v => v.category === 'equipment').length}</div>
          <div style={styles.summaryLabel}>Equipment</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{vendors.filter(v => v.category === 'furniture').length}</div>
          <div style={styles.summaryLabel}>Furniture</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{vendors.filter(v => v.category === 'lighting' || v.category === 'audio').length}</div>
          <div style={styles.summaryLabel}>Tech</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:     { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title:         { fontSize: '28px', fontWeight: '600', color: 'var(--color-text)' },
  addButton:     { padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
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
  categoryTabs:  { display: 'flex', gap: '8px', marginBottom: '20px' },
  categoryTab:   { padding: '8px 16px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text)' },
  categoryTabActive: { backgroundColor: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' },
  loading:       { textAlign: 'center', padding: '40px', color: 'var(--color-text-light)' },
  vendorGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' },
  vendorCard:    { backgroundColor: 'var(--color-surface)', padding: '20px', borderRadius: '12px', boxShadow: 'var(--color-card-shadow)', border: '1px solid var(--color-border)' },
  vendorHeader:  { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  vendorIcon:    { fontSize: '32px' },
  categoryBadge: { padding: '4px 10px', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary)', borderRadius: '10px', fontSize: '12px', textTransform: 'capitalize' },
  vendorName:    { fontSize: '16px', fontWeight: '600', color: 'var(--color-text)', marginBottom: '8px' },
  vendorInfo:    { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--color-text-light)', marginBottom: '12px' },
  rating:        { fontSize: '14px', color: 'var(--color-warning)', marginBottom: '12px' },
  ratingValue:   { color: 'var(--color-text-light)', marginLeft: '8px', fontSize: '12px' },
  vendorActions: { display: 'flex', gap: '8px' },
  contactButton: { flex: 1, padding: '8px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  deleteButton:  { flex: 1, padding: '8px', backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)', border: '1px solid var(--color-error)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  noData:        { gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--color-text-light)', backgroundColor: 'var(--color-surface)', borderRadius: '12px' },
  summaryGrid:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  summaryCard:   { backgroundColor: 'var(--color-surface)', padding: '20px', borderRadius: '12px', boxShadow: 'var(--color-card-shadow)', textAlign: 'center', border: '1px solid var(--color-border)' },
  summaryValue:  { fontSize: '28px', fontWeight: '600', color: 'var(--color-primary)' },
  summaryLabel:  { fontSize: '14px', color: 'var(--color-text-light)', marginTop: '4px' }
};

export default VendorSourcing;
