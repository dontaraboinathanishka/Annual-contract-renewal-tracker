import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass = 'brand', subtext }) => {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-600 border border-brand-100',
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border border-blue-100',
  };

  const badgeColor = colorMap[colorClass] || colorMap.brand;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
        {subtext && <p className="text-xs text-slate-400 font-medium">{subtext}</p>}
      </div>
      <div className={`p-3.5 rounded-xl ${badgeColor}`}>
        <Icon className="w-6 h-6 stroke-[2]" />
      </div>
    </div>
  );
};

export default StatCard;
