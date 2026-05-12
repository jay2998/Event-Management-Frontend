import React from 'react';

const StatCard = ({ title, value, trend, trendType = 'up', icon, color = 'teal' }) => {
  const colors = {
    teal: 'from-teal-500 to-teal-600 shadow-teal-100',
    green: 'from-emerald-500 to-teal-500 shadow-emerald-100',
    orange: 'from-amber-500 to-orange-500 shadow-amber-100',
    purple: 'from-cyan-500 to-teal-500 shadow-cyan-100',
    blue: 'from-sky-500 to-teal-500 shadow-sky-100',
  };

  const trendIcon = trendType === 'up' ? '▲' : '▼';

  return (
    <div className="group relative bg-[var(--color-surface)] p-6 rounded-2xl shadow-[var(--color-card-shadow)] border border-[rgba(13,148,136,0.14)] hover:translate-y-[-4px] transition-all duration-300 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors[color]} text-white shadow-xl mr-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--color-text-light)] uppercase tracking-wider mb-1">{title}</p>
            <p className="text-2xl font-black text-[var(--color-text)] group-hover:text-[var(--color-primary-dark)] transition-colors">
              {value}
            </p>
          </div>
        </div>
        {trend !== undefined && (
          <div
            className={`text-xs font-black px-3 py-1.5 rounded-full ${
              trendType === 'up'
                ? 'bg-teal-100 text-teal-700'
                : 'bg-red-100 text-red-700'
            } border border-transparent shadow-sm`}
          >
            {trendIcon} {trend}%
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;


