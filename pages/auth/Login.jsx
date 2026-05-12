import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getProfile } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext'; 
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); // Get the login function from AuthContext
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await login(formData);
      // The login response usually contains both the token and the user object.
      // Calling getProfile() here fails with 401 because the token isn't yet 
      // set in the global API headers until authLogin is executed.
      const { token, user } = response.data.data;
      await authLogin(token, user); 
      
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.container}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={styles.loginBox}
      >
        <div style={styles.logo}>🎉</div>
        <h1 style={styles.title}>Event Management</h1>
        <p style={styles.subtitle}>Please sign in to your account</p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit" 
            style={styles.button} 
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--color-background)',
    padding: '20px',
  },
  loginBox: {
    backgroundColor: 'var(--color-surface)',
    padding: '48px 40px',
    borderRadius: '24px',
    boxShadow: 'var(--color-card-shadow)',
    width: '100%',
    maxWidth: '440px',
    textAlign: 'center',
    border: '1px solid var(--color-border)',
  },
  logo: { fontSize: '40px', marginBottom: '16px' },
  title: {
    color: 'var(--color-text)',
    marginBottom: '8px',
    fontSize: '28px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: 'var(--color-text-light)',
    marginBottom: '32px',
    fontSize: '15px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    textAlign: 'left',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--color-text)',
    marginLeft: '4px',
  },
  input: {
    padding: '14px 16px',
    fontSize: '15px',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
    outline: 'none',
    transition: 'all 0.2s',
  },
  button: {
    padding: '16px',
    fontSize: '16px',
    fontWeight: '700',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '8px',
    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)',
  },
  error: {
    padding: '14px',
    backgroundColor: 'var(--color-error-light)',
    color: 'var(--color-error)',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid var(--color-error)',
  },
};

export default Login;
