import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import '../sidebar.css';
import { renderAppIcon } from './icon/AppIcons';

const Sidebar = ({ isOpen, onToggle, isMobile }) => {

  const navigate = useNavigate();
  const location = useLocation();
  const getUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr || userStr === 'undefined') return {};
      return JSON.parse(userStr);
    } catch { return {}; }
  };
  const user = getUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const allMenuItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard', roles: ['admin', 'vendor', 'customer'] },
    { path: '/halls', label: 'Halls', icon: 'halls', roles: ['admin', 'vendor', 'customer'] },
    { path: '/bookings', label: 'Bookings', icon: 'bookings', roles: ['admin', 'vendor', 'customer'] },
    { path: '/catering/menu', label: 'Menu Planner', icon: 'menu', roles: ['admin', 'vendor', 'customer'] },
    { path: '/catering/one-dish', label: 'Quality Check', icon: 'quality', roles: ['admin', 'vendor', 'supervisor'] },
    { path: '/rentals/inventory', label: 'Inventory', icon: 'inventory', roles: ['admin', 'vendor'] },
    { path: '/rentals/damage-report', label: 'Damage Report', icon: 'damage', roles: ['admin', 'vendor'] },
    { path: '/rentals/maintenance', label: 'Maintenance', icon: 'maintenance', roles: ['admin', 'vendor'] },
    { path: '/rentals/vendors', label: 'Vendors', icon: 'vendors', roles: ['admin', 'vendor'] },
    { path: '/vehicles/fleet', label: 'Fleet', icon: 'fleet', roles: ['admin', 'vendor'] },
    { path: '/vehicles/drivers', label: 'Drivers', icon: 'drivers', roles: ['admin', 'vendor'] },
    { path: '/admin/access-control', label: 'Access Control', icon: 'userManagement', roles: ['admin'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user.role || 'customer'));


  const sidebarWidth = isMobile ? '240px' : (isOpen ? '240px' : '70px');
  const sidebarTransform = isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)';

  return (
    <aside style={{
      ...styles.sidebar,
      width: sidebarWidth,
      transform: sidebarTransform,
      backgroundColor: 'var(--color-surface)',
      borderRight: `1px solid var(--color-border)`,
    }}>
      {!isMobile && (
        <button onClick={onToggle} style={styles.burgerButton}>
          {isOpen ? '✕' : '☰'}
        </button>
      )}
      {isMobile && isOpen && (
        <button onClick={onToggle} style={styles.burgerButton}>
          ✕
        </button>
      )}

      {isOpen && (
        <button onClick={toggleTheme} style={{ ...styles.themeToggle, border: 'none', width: 'calc(100% - 24px)', font: 'inherit' }}>
          <span style={styles.navIcon}>{renderAppIcon(isDarkMode ? 'themeSun' : 'themeMoon', { size: 18 })}</span>
          <span style={styles.navLabel}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      )}
      
      {isOpen && (
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{user.name?.charAt(0) || 'U'}</div>
          <div style={styles.userName}>{user.name || 'User'}</div>
          <div style={styles.userRole}>{user.role || 'Customer'}</div>
        </div>
      )}

      <nav style={{...styles.nav, padding: isOpen ? '10px' : '10px 5px'}} className="sidebar-nav"> 

        {menuItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path} 
            style={{
              ...styles.navLink, 
              justifyContent: isOpen ? 'flex-start' : 'center', 
              padding: isOpen ? '12px 16px' : '12px 8px', 
              color: location.pathname === item.path ? 'var(--color-primary)' : 'var(--color-text-light)',
              backgroundColor: location.pathname === item.path ? 'var(--color-primary-50)' : 'transparent',
              fontWeight: location.pathname === item.path ? '600' : '500',
            }}
            title={item.label}
          >
            <span style={styles.navIcon}>{renderAppIcon(item.icon, { size: 18 })}</span>


            {isOpen && <span style={styles.navLabel}>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div style={styles.logoutSection}>
        <button onClick={handleLogout} style={{...styles.logoutButton, justifyContent: isOpen ? 'center' : 'center', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)'}}>
          {renderAppIcon('logOut', { size: 18, style: { color: 'var(--color-primary)' } })} {isOpen && 'Logout'}

        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    transition: 'width 0.3s ease, transform 0.3s ease',
    overflow: 'hidden',
    zIndex: 1000,
    boxShadow: 'var(--color-card-shadow)',
  },
  burgerButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--color-text)',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    textAlign: 'left',
  },
  logo: {
    padding: '20px',
    borderBottom: '1px solid var(--color-border)',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--color-text)',
    margin: 0,
  },
  userInfo: {
    padding: '20px',
    borderBottom: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--color-surface)',
  },
avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '600',
    border: '2px solid var(--color-border)',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--color-text)',
  },
userRole: {
    fontSize: '11px',
    color: 'var(--color-text-light)',
    textTransform: 'capitalize',
    fontWeight: '500',
    backgroundColor: 'var(--color-surface-soft)',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  nav: {
    flex: 1,
    padding: '12px',
    overflowY: 'auto',
    // Hide scrollbar but keep scrolling enabled
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },

navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    color: 'var(--color-text-light)',
    textDecoration: 'none',
    marginBottom: '4px',
    transition: 'all 0.2s',
  },
  navIcon: {
    fontSize: '18px',
  },
  navLabel: {
    fontSize: '14px',
    fontWeight: '500',
  },
  footer: { marginTop: 'auto' },
  themeToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    margin: '0 12px 12px',
    borderRadius: '12px',
    cursor: 'pointer',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text-light)',
    transition: 'all 0.2s',
  },
  toggleSwitch: {
    marginLeft: 'auto',
    width: '36px',
    height: '18px',
    backgroundColor: 'var(--color-border)',
    borderRadius: '10px',
    padding: '2px',
  },
  toggleThumb: {
    width: '14px',
    height: '14px',
    backgroundColor: 'var(--color-primary)',
    borderRadius: '50%',
    transition: 'transform 0.2s ease',
  },
  logoutSection: {
    padding: '20px 15px',
    borderTop: '1px solid var(--color-border)',
  },
  logoutButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'var(--color-error-light)',
    color: 'var(--color-error)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background-color 0.2s ease',
  },
};

export default Sidebar;
