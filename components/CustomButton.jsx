import React from 'react';

const CustomButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  type = 'button',
  style = {}
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: 'var(--color-primary)', color: 'white' };
      case 'secondary':
        return {
          backgroundColor: 'var(--color-surface-soft)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
        };
      case 'danger':
        return { backgroundColor: 'var(--color-error)', color: 'white' };
      case 'success':
        return { backgroundColor: 'var(--color-success)', color: 'white' };
      case 'warning':
        return { backgroundColor: 'var(--color-warning)', color: 'white' };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-primary)',
          border: '1px solid var(--color-primary)',
        };
      default:
        return { backgroundColor: 'var(--color-primary)', color: 'white' };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { padding: '8px 16px', fontSize: '12px' };
      case 'medium':
        return { padding: '12px 24px', fontSize: '14px' };
      case 'large':
        return { padding: '16px 32px', fontSize: '16px' };
      default:
        return { padding: '12px 24px', fontSize: '14px' };
    }
  };

  const buttonStyle = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    border: 'none',
    borderRadius: '10px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s',
    fontWeight: '500',
    ...style
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
    >
      {children}
    </button>
  );
};

export default CustomButton;
