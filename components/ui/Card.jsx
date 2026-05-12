import React from 'react';

const Card = ({ children, className = '', header, footer, title, actionButton }) => {
  return (
<div className={`bg-[var(--color-surface)] rounded-[16px] shadow-[var(--color-card-shadow)] border border-[var(--color-border)] overflow-hidden transition-all duration-300 ${className}`}>
      {(header || title) && (
        <div className="px-6 py-5 border-b border-[var(--color-border)] flex items-center justify-between">
          {title ? <h3 className="text-lg font-bold text-[var(--color-text)]">{title}</h3> : header}
          {actionButton}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {footer && (
<div className="px-6 py-5 border-t border-[var(--color-border)] bg-[var(--color-surface-soft)] rounded-b-[16px]">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

