import React from 'react';

const Table = ({ columns, data, onRowClick, className = '' }) => {
  return (
    <div className={`w-full bg-[var(--color-surface)] rounded-2xl shadow-[var(--color-card-shadow)] border border-[var(--color-border)] overflow-hidden ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="bg-[var(--color-surface-soft)]">
            {columns.map((column, index) => (
              <th 
                key={index}
                className="px-6 py-5 text-left text-xs font-black text-[var(--color-primary-dark)] uppercase tracking-widest border-b border-[var(--color-border)]"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {data.map((row, rowIndex) => (
            <tr 
              key={row.id || rowIndex}
              className="hover:bg-[var(--color-primary-50)] transition-colors duration-150 cursor-pointer"
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => (
                <td 
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text)] font-medium"
                >
                  {column.render ? column.render(row) : row[column.key] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

