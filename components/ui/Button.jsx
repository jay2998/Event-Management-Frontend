import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ children, variant = 'primary', size = 'md', className = '', as: As = 'button', ...props }) => {
  const baseClasses = 'font-semibold rounded-[12px] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 inline-flex items-center justify-center border active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white border-transparent shadow-sm',
    secondary: 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)] text-[var(--color-primary-dark)] border-[var(--color-border)]',
    danger: 'bg-[var(--color-error)] hover:bg-[var(--color-error)] opacity-90 hover:opacity-100 text-white border-transparent',
    success: 'bg-[var(--color-success)] hover:bg-[var(--color-success)] opacity-90 hover:opacity-100 text-white border-transparent',
    ghost: 'bg-transparent hover:bg-[var(--color-surface-soft)] text-[var(--color-text-light)] border-transparent',
    outline: 'bg-transparent hover:bg-[var(--color-primary-50)] text-[var(--color-primary)] border-[var(--color-primary)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  if (As === 'link') {
    return <Link className={classes} {...props}>{children}</Link>;
  }

  return <As className={classes} {...props}>{children}</As>;
};

export default Button;

