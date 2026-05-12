import React, { useState, useEffect } from 'react';
import { fetchInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/ui/Card';

const Inventory = () => {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    category: 'equipment',
    quantity: 1,
    unit: 'pieces',
    condition: 'good',
    location: '',
    notes: '',
    city: '',
    pricePerUnit: 0
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await fetchInventory();
      setItems(response.data?.data || []);

    } catch (err) {
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentItem) {
        await updateInventoryItem(currentItem._id, formData);
      } else {
        await createInventoryItem(formData);
      }

      setShowForm(false);
      setCurrentItem(null);
      setFormData({
        name: '',
        category: 'equipment',
        quantity: 1,
        unit: 'pieces',
        condition: 'good',
        location: '',
        notes: '',
        city: '',
        pricePerUnit: 0
      });
      loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      condition: item.condition,
      city: item.city || '',
      pricePerUnit: item.pricePerUnit || 0,
      location: item.location || '',
      notes: item.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteInventoryItem(itemId);
        loadItems();

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete item');
      }
    }
  };

  const categories = ['all', 'equipment', 'furniture', 'decor', 'lighting', 'audio'];

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getConditionStyle = (condition) => {
    switch (condition) {
      case 'excellent': return { bg: 'var(--color-success-light)', text: 'var(--color-success)' };
      case 'good':      return { bg: 'var(--color-primary-50)', text: 'var(--color-primary)' };
      case 'fair':      return { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' };
      case 'poor':      return { bg: 'var(--color-error-light)', text: 'var(--color-error)' };
      default:          return { bg: 'var(--color-surface-soft)', text: 'var(--color-text-light)' };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Rental Inventory</h1>
        <button onClick={() => {
          setShowForm(!showForm);
          setCurrentItem(null);
          setFormData({
            name: '',
            category: 'equipment',
            quantity: 1,
            unit: 'pieces',
            condition: 'good',
            location: '',
            notes: '',
            city: '',
            pricePerUnit: 0
          });
        }} style={styles.addButton}>
          {showForm ? 'View Inventory' : '+ Add New Item'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div style={styles.formCard}>
              <h2 style={styles.sectionTitle}>{currentItem ? 'Edit Item' : 'Register New Asset'}</h2>
              <form onSubmit={handleSubmit} style={styles.form}>
                 <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Item Name *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} style={styles.input} placeholder="e.g. LED Par Light" required />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Category *</label>
                      <select name="category" value={formData.category} onChange={handleChange} style={styles.select} required>
                        {categories.slice(1).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Quantity *</label>
                      <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Unit</label>
                      <select name="unit" value={formData.unit} onChange={handleChange} style={styles.select}>
                         <option value="pieces">Pieces</option>
                         <option value="sets">Sets</option>
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Condition</label>
                      <select name="condition" value={formData.condition} onChange={handleChange} style={styles.select}>
                         <option value="excellent">Excellent</option>
                         <option value="good">Good</option>
                         <option value="fair">Fair</option>
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Location</label>
                      <input type="text" name="location" value={formData.location} onChange={handleChange} style={styles.input} placeholder="e.g. Rack A-12" />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>City *</label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} style={styles.input} placeholder="e.g. Karachi" required />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Price Per Unit *</label>
                      <input type="number" name="pricePerUnit" value={formData.pricePerUnit} onChange={handleChange} style={styles.input} required />
                    </div>
                 </div>
                 <div style={styles.formGroup}>
                    <label style={styles.label}>Asset Notes</label>
                    <input name="notes" value={formData.notes} onChange={handleChange} style={styles.input} placeholder="Maintenance history..." />
                 </div>
                 <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" style={styles.submitButton}>{currentItem ? 'Save Changes' : 'Confirm Registration'}</button>
                    <button type="button" onClick={() => setShowForm(false)} style={styles.cancelButton}>Cancel</button>
                 </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-primary)]"></div></div>
      ) : (
        <Card title={
          <div>
            <div className="text-lg font-semibold text-[var(--color-text)]">Inventory Registry</div>
            <div className="text-sm text-[var(--color-text-light)] mt-1">Track all rental assets with stock levels, condition status, and actions.</div>
          </div>
        } className="overflow-hidden shadow-lg">
          <div style={styles.filterBar} className="mb-6">
            <div className="flex-1 min-w-[280px]">
              <input
                style={styles.searchInput}
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={styles.categoryTabs}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)} style={categoryFilter === cat ? {...styles.categoryTab, ...styles.categoryTabActive} : styles.categoryTab}>
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto bg-[var(--color-surface)] rounded-[16px] border border-[var(--color-border)]">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-[var(--color-surface-soft)]">
                  <th className="px-6 py-5 text-left text-[11px] font-black uppercase text-[var(--color-primary-dark)] tracking-widest border-b border-[var(--color-border)]">Asset Name</th>
                  <th className="px-6 py-5 text-left text-[11px] font-black uppercase text-[var(--color-primary-dark)] tracking-widest border-b border-[var(--color-border)]">Category</th>
                  <th className="px-6 py-5 text-left text-[11px] font-black uppercase text-[var(--color-primary-dark)] tracking-widest border-b border-[var(--color-border)]">Stock Level</th>
                  <th className="px-6 py-5 text-left text-[11px] font-black uppercase text-[var(--color-primary-dark)] tracking-widest border-b border-[var(--color-border)]">Condition</th>
                  <th className="px-6 py-5 text-right text-[11px] font-black uppercase text-[var(--color-primary-dark)] tracking-widest border-b border-[var(--color-border)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-[var(--color-text-light)]">No assets found. Add a new item to begin tracking your inventory.</td>
                  </tr>
                ) : filteredItems.map(item => (
                  <tr key={item._id} className="hover:bg-[var(--color-primary-50)] transition-colors">
                    <td className="px-6 py-5 align-top">
                       <div className="text-sm font-bold text-[var(--color-text)]">{item.name}</div>
                       <div className="text-[10px] text-[var(--color-text-light)] font-mono mt-1">{item.location || 'UNASSIGNED'}</div>
                    </td>
                    <td className="px-6 py-5 align-top">
                       <span className="inline-flex items-center px-3 py-1 bg-[var(--color-surface-soft)] text-[var(--color-text-light)] rounded-full text-[10px] font-black uppercase">
                         {item.category}
                       </span>
                    </td>
                    <td className="px-6 py-5 align-top text-sm font-black text-[var(--color-text)]">
                       {item.quantity} <span className="text-[10px] font-bold opacity-40 uppercase ml-1">{item.unit}</span>
                    </td>
                    <td className="px-6 py-5 align-top">
                       <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase" style={getConditionStyle(item.condition)}>
                         {item.condition}
                       </span>
                    </td>
                    <td className="px-6 py-5 align-top text-right space-x-2">
                       <button onClick={() => handleEdit(item)} style={styles.editButton}>Edit</button>
                       <button onClick={() => handleDelete(item._id)} style={styles.deleteButton}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{items.length}</div>
          <div style={styles.summaryLabel}>Total Assets</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{items.filter(i => i.category === 'equipment').length}</div>
          <div style={styles.summaryLabel}>Equipment</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{items.filter(i => i.condition === 'good' || i.condition === 'excellent').length}</div>
          <div style={styles.summaryLabel}>Optimal Units</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '30px', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '-0.02em' },
  addButton: { padding: '12px 26px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 10px 24px rgba(16, 185, 129, 0.08)' },
  cancelButton: { padding: '12px 24px', backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '12px', cursor: 'pointer', fontSize: '14px' },
  error: { padding: '12px', backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)', borderRadius: '4px', marginBottom: '20px' },
  formCard: { backgroundColor: 'var(--color-surface)', padding: '20px', borderRadius: '12px', boxShadow: 'var(--color-card-shadow)', marginBottom: '24px', border: '1px solid var(--color-border)' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', color: 'var(--color-text)', marginBottom: '16px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '500', color: 'var(--color-text)' },
  input: { padding: '12px', fontSize: '14px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text)' },
  select: { padding: '12px', fontSize: '14px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' },
  submitButton: { padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  editButton: { 
    padding: '6px 12px', 
    backgroundColor: 'var(--color-primary-50)', 
    color: 'var(--color-primary)', 
    border: '1px solid var(--color-primary-100)', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '12px', 
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  deleteButton: { 
    padding: '6px 12px', 
    backgroundColor: 'var(--color-error-light)', 
    color: 'var(--color-error)', 
    border: '1px solid var(--color-error-200)', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '12px', 
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  filterBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', padding: '18px 20px', borderRadius: '16px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-soft)' },
  filters: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' },
  searchInput: { padding: '14px 16px', border: '1px solid var(--color-border)', borderRadius: '14px', width: '100%', maxWidth: '420px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', outline: 'none' },
  categoryTabs: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  categoryTab: { padding: '10px 18px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text)', transition: 'all 0.2s' },
  categoryTabActive: { backgroundColor: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' },
  categoryTabs: { display: 'flex', gap: '8px' },
  categoryTab: { padding: '8px 16px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text)' },
  categoryTabActive: { backgroundColor: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  summaryCard: { backgroundColor: 'var(--color-surface)', padding: '20px', borderRadius: '12px', boxShadow: 'var(--color-card-shadow)', textAlign: 'center', border: '1px solid var(--color-border)' },
  summaryValue: { fontSize: '28px', fontWeight: '600', color: 'var(--color-primary)' },
  summaryLabel: { fontSize: '14px', color: 'var(--color-text-light)', marginTop: '4px' }
};

export default Inventory;
