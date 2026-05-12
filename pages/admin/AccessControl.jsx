import React, { useState, useEffect } from 'react';
import { fetchUsers, updateUser, createUser, deleteUser } from '../../services/api';
import Card from '../../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, UserPlus, X, Save } from 'lucide-react';

const validatePakistaniPhone = (phone) => {
  if (!phone) return true;
  const normalized = String(phone).replace(/\s/g, '').replace(/-/g, '');
  const phoneRegex = /^(\+92\d{10}|03\d{9})$/;
  return phoneRegex.test(normalized);
};

const AccessControl = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', role: 'customer', isActive: true });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchUsers();
      setUsers(response.data?.data || []);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validatePakistaniPhone(formData.phone)) {
      setError('Please provide a valid Pakistani phone number (+92... or 03...)');
      return;
    }
    try {
      await createUser(formData);
      loadUsers();
      setIsFormOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '', role: 'customer', isActive: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!validatePakistaniPhone(formData.phone)) {
      setError('Please provide a valid Pakistani phone number (+92... or 03...)');
      return;
    }
    try {
      await updateUser(selectedUser._id, formData);
      loadUsers();
      setIsFormOpen(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', password: '', phone: '', role: 'customer', isActive: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const openForm = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({ 
        name: user.name, 
        email: user.email, 
        password: '', 
        phone: user.phone || '', 
        role: user.role, 
        isActive: user.isActive 
      });
    } else {
      setSelectedUser(null);
      setFormData({ name: '', email: '', password: '', phone: '', role: 'customer', isActive: true });
    }
    setIsFormOpen(true);
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case 'admin':    return { bg: 'var(--color-error-light)', text: 'var(--color-error)' };
      case 'vendor':   return { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' };
      case 'customer': return { bg: 'var(--color-primary-50)', text: 'var(--color-primary)' };
      default:         return { bg: 'var(--color-surface-soft)', text: 'var(--color-text-light)' };
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Access Control</h1>
        <button onClick={() => openForm()} style={{...styles.addButton, display: 'flex', alignItems: 'center', gap: '8px'}}>
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <AnimatePresence mode="wait">
        {isFormOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginBottom: 0 }} 
            animate={{ height: 'auto', opacity: 1, marginBottom: 24 }} 
            exit={{ height: 0, opacity: 0, marginBottom: 0 }} 
            style={{ overflow: 'hidden' }}
          >
            <div style={styles.formCard}>
               <div style={styles.formHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: 'var(--color-primary-50)', padding: '8px', borderRadius: '10px', color: 'var(--color-primary)' }}>
                      {selectedUser ? < Pencil size={20} /> : <UserPlus size={20} />}
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                        {selectedUser ? 'Update System User' : 'Create System User'}
                      </h2>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-light)' }}>
                        {selectedUser ? `Modifying account for ${selectedUser.email}` : 'Assign roles and credentials for a new account'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setIsFormOpen(false)} style={styles.closeBtn}>
                    <X size={20} />
                  </button>
               </div>
               <form onSubmit={selectedUser ? handleUpdate : handleCreate} style={{ padding: '24px' }}>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Full Name *</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Email Address *</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Phone Number</label>
                      <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={styles.input} />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Assigned Role</label>
                      <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={styles.select}>
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    {!selectedUser && (
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Password *</label>
                        <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={styles.input} required />
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="submit" style={{...styles.submitButton, display: 'flex', alignItems: 'center', gap: '8px'}}><Save size={18}/> {selectedUser ? 'Save Changes' : 'Create Account'}</button>
                    <button type="button" onClick={() => setIsFormOpen(false)} style={styles.cancelButton}>Cancel</button>
                  </div>
               </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={styles.tableCard}>
        <h2 style={styles.sectionTitle}>System Directory</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>User Profile</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px' }}>{user.name}</td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{...styles.roleBadge, backgroundColor: getRoleStyle(user.role).bg, color: getRoleStyle(user.role).text}}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{user.isActive ? 'Active' : 'Locked'}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openForm(user)}
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
                        onClick={() => handleDelete(user._id)}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{users.length}</div>
          <div style={styles.summaryLabel}>Total Users</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{users.filter(u => u.role === 'admin').length}</div>
          <div style={styles.summaryLabel}>Admins</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{users.filter(u => u.isActive).length}</div>
          <div style={styles.summaryLabel}>Active Accounts</div>
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
  error:         { padding: '12px', backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--color-error)' },
  tableCard:     { backgroundColor: 'var(--color-surface)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--color-card-shadow)', marginBottom: '24px', border: '1px solid rgba(13,148,136,0.14)' },
  formCard:      { backgroundColor: 'var(--color-surface)', borderRadius: '16px', boxShadow: 'var(--color-card-shadow)', border: '1px solid var(--color-border)', overflow: 'hidden' },
  formHeader:    { padding: '20px 24px', borderBottom: '1px solid rgba(13,148,136,0.14)', background: 'linear-gradient(180deg, rgba(240,253,250,0.95) 0%, rgba(255,255,255,1) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn:      { background: 'none', border: 'none', color: 'var(--color-text-light)', cursor: 'pointer', padding: '4px' },
  sectionTitle:  { fontSize: '19px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '16px', letterSpacing: '-0.2px' },
  form:          { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' },
  formGroup:     { display: 'flex', flexDirection: 'column', gap: '8px' },
  label:         { fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' },
  input:         { padding: '12px 14px', fontSize: '14px', border: '1px solid var(--color-border)', borderRadius: '12px', backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text)' },
  select:        { padding: '12px 14px', fontSize: '14px', border: '1px solid var(--color-border)', borderRadius: '12px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' },
  submitButton:  { padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  cancelButton:  { padding: '12px 24px', backgroundColor: 'rgba(13,148,136,0.08)', color: 'var(--color-text)', border: '1px solid rgba(13,148,136,0.16)', borderRadius: '12px', cursor: 'pointer', fontSize: '14px' },
  roleBadge:     { padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' },
  iconBtn:       { border: 'none', background: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', marginLeft: '4px' },
  summaryGrid:   { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '32px' },
  summaryCard:   { backgroundColor: 'var(--color-surface)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--color-card-shadow)', textAlign: 'center', border: '1px solid rgba(13,148,136,0.14)' },
  summaryValue:  { fontSize: '30px', fontWeight: '700', color: 'var(--color-primary-dark)', letterSpacing: '-0.4px' },
  summaryLabel:  { fontSize: '14px', color: 'var(--color-text-light)', marginTop: '4px', lineHeight: 1.35 }
};

export default AccessControl;
