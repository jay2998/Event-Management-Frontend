import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { renderAppIcon } from './icon/AppIcons';
import { fetchNotifications, markNotificationsRead } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ sidebarOpen, onToggleSidebar, isMobile }) => {
  const navigate = useNavigate();

  const getUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr || userStr === 'undefined') return {};
      return JSON.parse(userStr);
    } catch {
      return {};
    }
  };

  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Notifications
  const notificationRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [logoHovered, setLogoHovered] = useState(false);

  useEffect(() => {
    const handleToast = (e) => {
      const { message, type } = e.detail;
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // This line was already updated
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    };
    window.addEventListener('app-toast', handleToast);
    return () => window.removeEventListener('app-toast', handleToast);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await fetchNotifications();
      setNotifications(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const markAllAsRead = async () => {
    try {
      await markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setDropdownOpen(false);
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!dropdownOpen) return;
      const el = notificationRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setDropdownOpen(false);
    };

    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [dropdownOpen]);

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.left}>
          <button onClick={onToggleSidebar} style={styles.navbarToggle}>
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <Link 
            to="/" 
            style={styles.logo}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
          >
            <span style={styles.logoIcon}>{renderAppIcon('party', { size: 22 })}</span>
            <span 
              style={{ 
                ...styles.logoText, 
                color: logoHovered ? 'var(--color-accent)' : 'var(--color-primary)' 
              }}
            >
              EventPro
            </span>
          </Link>
        </div>

        <div style={styles.right}>
          <div ref={notificationRef} style={{ position: 'relative', display: 'inline-flex' }}>
            <button
              onClick={toggleDropdown}
              style={styles.iconButton}
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
              title="Notifications"
            > 
              <span style={styles.notificationIcon}>{renderAppIcon('bell', { size: 18 })}</span>
              {unreadCount > 0 && <span style={styles.notificationBadge}>{unreadCount}</span>}
            </button>

            {dropdownOpen && (
              <div style={styles.dropdown} role="menu" aria-label="Notifications" id="notifications-dropdown">
                <div style={styles.dropdownHeader}>
                  <span style={styles.dropdownTitle}>Alerts</span>
                  <button style={styles.markAllButton} onClick={markAllAsRead} type="button">
                    Mark all as read
                  </button>
                </div>
                <div style={styles.dropdownList}>
                  {notifications.length === 0 ? (
                    <div style={styles.emptyState}>No notifications</div>
                  ) : (
                    notifications
                      .slice()
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((n) => (
                        <div
                          key={n._id}
                          style={{
                            ...styles.alertItem,
                            ...(n.read ? styles.alertItemRead : styles.alertItemUnread),
                          }}
                        >
                          <div style={styles.alertMessage}>
                            <span style={styles.alertDot}>{n.read ? '•' : '⚠'}</span>
                            <span>{n.message}</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={styles.userMenu}>
            <div style={styles.avatar}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user.name || 'User'}</span>
              <span style={styles.userRole}>{user.role || 'Customer'}</span>
            </div>
          </div>

          <button onClick={handleLogout} style={styles.logoutButton}>
            {renderAppIcon('logOut', { size: 18 })}
          </button>
        </div>
      </nav>

      {/* Global Toast Container moved outside flex flow to fix centering issues */}
      <div style={styles.toastContainer}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{ ...styles.toast, ...styles[toast.type] }}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};


const styles = {
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    height: '60px',
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    boxShadow: 'var(--color-card-shadow)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1001,
  },
  toast: {
    padding: '12px 20px',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  success: { backgroundColor: 'var(--color-success)' },
  error: { backgroundColor: 'var(--color-error)' },
  info: { backgroundColor: 'var(--color-primary)' },
  toastContainer: {
    position: 'fixed',
    top: '80px',
    right: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    zIndex: 1002,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    color: 'var(--color-text)',
  },
  logoIcon: {
    fontSize: '24px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--color-primary)',
    transition: 'color 0.2s ease',
  },
  center: {
    flex: 1,
    maxWidth: '500px',
    margin: '0 40px',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--color-surface-soft)',
    borderRadius: '8px',
    padding: '8px 16px',
  },
  searchIcon: {
    marginRight: '8px',
    fontSize: '14px',
    color: 'var(--color-text-light)',
  },
  searchInput: {
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
    color: 'var(--color-text)',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconButton: {
    position: 'relative',
    background: 'var(--color-surface-soft)',
    border: '1px solid var(--color-border)',
    fontSize: '20px',
    color: 'var(--color-text)',
    cursor: 'pointer',
    padding: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderRadius: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
  },
  notificationIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    backgroundColor: 'var(--color-error)',
    color: 'white',
    fontSize: '10px',
    padding: '2px 5px',
    borderRadius: '10px',
    fontWeight: '600',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '4px 10px',
    backgroundColor: 'var(--color-surface-soft)',
    borderRadius: '8px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '600',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--color-text)',
  },
  userRole: {
    fontSize: '11px',
    color: 'var(--color-text-light)',
    textTransform: 'capitalize',
    fontWeight: '500',
    backgroundColor: 'var(--color-surface-soft)',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  navbarToggle: {
    background: 'transparent',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    fontSize: '18px',
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
    cursor: 'pointer',
  },
  logoutButton: {
    background: 'var(--color-error-light)',
    border: 'none',
    color: 'var(--color-error)',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
  },
  // Modern Clean notification dropdown styles
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 12px)',
    width: '340px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    overflow: 'hidden',
    zIndex: 1002,
    animation: 'slideIn 0.2s ease-out',
  },
  dropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    backgroundColor: 'var(--color-surface-soft)',
    borderBottom: '1px solid var(--color-border)',
  },
  dropdownTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--color-text)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  markAllButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--color-primary)',
    padding: '4px 8px',
    fontWeight: '700',
    fontSize: '11px',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  },
  dropdownList: {
    padding: '12px',
    backgroundColor: 'var(--color-surface)',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  emptyState: {
    padding: '32px 20px',
    textAlign: 'center',
    fontWeight: '500',
    color: 'var(--color-text-light)',
    fontSize: '13px',
  },
  alertItem: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: '1px solid transparent',
  },
  alertItemUnread: {
    backgroundColor: 'var(--color-primary-50)',
    border: '1px solid var(--color-primary-100)',
  },
  alertItemRead: {
    backgroundColor: 'transparent',
    opacity: 0.7,
  },
  alertMessage: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    color: 'var(--color-text)',
    fontWeight: '600',
    fontSize: '13px',
    lineHeight: 1.4,
  },
  alertDot: {
    marginTop: '4px',
    display: 'inline-flex',
    width: '8px',
    height: '8px',
    flexShrink: 0,
    backgroundColor: 'var(--color-primary)',
    borderRadius: '50%',
    boxShadow: '0 0 0 4px var(--color-primary-100)',
  },
};

export default Navbar;
