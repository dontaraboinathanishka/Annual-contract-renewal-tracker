import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    Active: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    Renewed: 'bg-blue-50 text-blue-700 border border-blue-200/60',
    Expired: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    Pending: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  };

  const currentStyle = styles[status] || 'bg-slate-50 text-slate-700 border border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide shadow-sm ${currentStyle}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full currentColor bg-current"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
