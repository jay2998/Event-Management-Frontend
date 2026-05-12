import React from 'react';

const FormInput = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[11px] font-black text-[var(--color-text-light)] uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-4 py-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary-100)] focus:border-[var(--color-primary)] outline-none rounded-[12px] shadow-sm ${className}`}
      />
      {error && <p className="text-xs font-bold text-[var(--color-error)] ml-1">{error}</p>}
    </div>
  );
};

const FormSelect = ({ label, error, children, className = '', ...props }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[11px] font-black text-[var(--color-text-light)] uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <select
        {...props}
        className={`w-full px-4 py-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary-100)] focus:border-[var(--color-primary)] outline-none rounded-[12px] shadow-sm appearance-none ${className}`}
      >
        {children}
      </select>
      {error && <p className="text-xs font-bold text-[var(--color-error)] ml-1">{error}</p>}
    </div>
  );
};

const FormTextarea = ({ label, error, className = '', rows = 4, ...props }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[11px] font-black text-[var(--color-text-light)] uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <textarea
        {...props}
        rows={rows}
        className={`w-full px-4 py-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary-100)] focus:border-[var(--color-primary)] outline-none resize-vertical rounded-[12px] shadow-sm ${className}`}
      />
      {error && <p className="text-xs font-bold text-[var(--color-error)] ml-1">{error}</p>}
    </div>
  );
};

export { FormInput, FormSelect, FormTextarea };

