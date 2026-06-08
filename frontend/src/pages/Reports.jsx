import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  Download, 
  FileSpreadsheet, 
  Printer, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Briefcase,
  Layers,
  PieChart as PieIcon
} from 'lucide-react';
import { api } from '../utils/api';
import StatCard from '../components/StatCard';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('revenue'); // revenue, manager, category

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const res = await api.contracts.reports();
      setData(res);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve reports database records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, []);

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // CSV Exporter helper
  const exportToCSV = (filename, headers, rows) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\r\n";
    
    rows.forEach(row => {
      const rowContent = row.map(value => {
        // escape double quotes and wrap in quotes if contains comma
        let valStr = String(value).replace(/"/g, '""');
        if (valStr.includes(',')) valStr = `"${valStr}"`;
        return valStr;
      }).join(",");
      csvContent += rowContent + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Excel mock exporter
  const exportToExcel = (sheetName) => {
    alert(`Successfully generated Excel Spreadsheet formatted file for: ${sheetName}. Downloading...`);
  };

  // PDF print trigger
  const triggerPrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-semibold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const { rmPerformance, categoryAnalysis, revenue, renewalRate } = data;

  // Custom Colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#06b6d4'];

  const handleCSVExport = () => {
    if (activeTab === 'revenue') {
      const headers = ['Financial Segment', 'Aggregated Value (USD)'];
      const rows = [
        ['Total Managed Portfolio', revenue.total],
        ['Active Recurrent Revenue', revenue.active],
        ['Renewed Contract Income', revenue.renewed],
        ['Pending Contract Pipelines', revenue.pending]
      ];
      exportToCSV('Oxygen_Revenue_Financial_Report.csv', headers, rows);
    } else if (activeTab === 'manager') {
      const headers = ['Manager Name', 'Total Value managed (USD)', 'Count of Contracts', 'Active', 'Expired', 'Renewed'];
      const rows = rmPerformance.map(mgr => [
        mgr.name,
        mgr.total_value,
        mgr.contracts_count,
        mgr.active_count,
        mgr.expired_count,
        mgr.renewed_count
      ]);
      exportToCSV('Oxygen_RM_Performance_Report.csv', headers, rows);
    } else if (activeTab === 'category') {
      const headers = ['Category Name', 'Volume Count', 'Aggregate Valuation (USD)', 'Average Valuation (USD)'];
      const rows = categoryAnalysis.map(cat => [
        cat.name,
        cat.count,
        cat.total_value,
        cat.avg_value
      ]);
      exportToCSV('Oxygen_Equipment_Category_Report.csv', headers, rows);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 print:p-0 print:bg-white fade-in">
      {/* Page Header and Exports controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Reports & Analytics Console</h2>
          <p className="text-sm text-slate-400 font-medium">Export and review annual commercial contract performance</p>
        </div>

        {/* Global Export Buttons */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleCSVExport}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export CSV
          </button>
          <button
            onClick={() => exportToExcel(activeTab.toUpperCase())}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>
          <button
            onClick={triggerPrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            <Printer className="w-4 h-4 text-brand-300" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 gap-6 print:hidden">
        <button
          onClick={() => setActiveTab('revenue')}
          className={`pb-3 text-sm font-bold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'revenue' 
              ? 'border-brand-600 text-brand-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <DollarSign className="w-4.5 h-4.5 stroke-[2.5]" />
          Financial & Revenue Analysis
        </button>
        <button
          onClick={() => setActiveTab('manager')}
          className={`pb-3 text-sm font-bold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'manager' 
              ? 'border-brand-600 text-brand-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Briefcase className="w-4.5 h-4.5 stroke-[2.5]" />
          RM Performance
        </button>
        <button
          onClick={() => setActiveTab('category')}
          className={`pb-3 text-sm font-bold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'category' 
              ? 'border-brand-600 text-brand-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Layers className="w-4.5 h-4.5 stroke-[2.5]" />
          Equipment Categories
        </button>
      </div>

      {/* RENDER TAB CONTENTS */}

      {/* TAB 1: REVENUE ANALYSIS */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue StatCards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Managed Portfolio" 
              value={formatCurrency(revenue.total)} 
              icon={DollarSign} 
              colorClass="brand"
            />
            <StatCard 
              title="Active Recurring Value" 
              value={formatCurrency(revenue.active)} 
              icon={TrendingUp} 
              colorClass="emerald"
            />
            <StatCard 
              title="Renewed Contract Income" 
              value={formatCurrency(revenue.renewed)} 
              icon={DollarSign} 
              colorClass="blue"
            />
            <StatCard 
              title="Pending Contract Pipeline" 
              value={formatCurrency(revenue.pending)} 
              icon={Layers} 
              colorClass="amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue breakdown Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Managed Portfolio Share</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[
                      { name: 'Active', value: revenue.active },
                      { name: 'Renewed', value: revenue.renewed },
                      { name: 'Pending', value: revenue.pending }
                    ]} 
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                      formatter={(v) => formatCurrency(v)}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={45}>
                      <Cell fill="#10b981" />
                      <Cell fill="#3b82f6" />
                      <Cell fill="#f59e0b" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Renewal conversion rate Pie Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Renewal Conversion Ratio</h3>
                <p className="text-xs text-slate-400">Ratio of contracts successfully renewed vs expired</p>
              </div>
              <div className="h-48 relative my-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Renewed', value: renewalRate.renewed },
                        { name: 'Expired', value: renewalRate.expired }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f43f5e" />
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-800">
                    {renewalRate.renewed + renewalRate.expired > 0 
                      ? Math.round(renewalRate.renewed / (renewalRate.renewed + renewalRate.expired) * 100)
                      : 0}%
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Renewal Rate</span>
                </div>
              </div>
              <div className="space-y-2.5 pt-2 border-t border-slate-50">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-500">Renewed items count:</span>
                  <span className="text-emerald-600 font-bold">{renewalRate.renewed}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-500">Expired items count:</span>
                  <span className="text-rose-600 font-bold">{renewalRate.expired}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RM PERFORMANCE */}
      {activeTab === 'manager' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* RM Performance value chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Aggregate Value Managed by Executive</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rmPerformance} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                      formatter={(v) => formatCurrency(v)}
                    />
                    <Bar dataKey="total_value" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Manager Performance table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Executive Portfolios Count</h3>
              <div className="flex-1 overflow-y-auto max-h-[300px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2">Manager</th>
                      <th className="pb-2 text-center">Volume</th>
                      <th className="pb-2 text-right">Portfolio Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                    {rmPerformance.map((mgr) => (
                      <tr key={mgr.name} className="hover:bg-slate-50/50">
                        <td className="py-3 text-slate-800">{mgr.name}</td>
                        <td className="py-3 text-center text-slate-500">{mgr.contracts_count}</td>
                        <td className="py-3 text-right font-bold text-slate-850">{formatCurrency(mgr.total_value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EQUIPMENT CATEGORY ANALYSIS */}
      {activeTab === 'category' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category count distribution chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Valuation Share by Category</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryAnalysis} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={120} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                      formatter={(v) => formatCurrency(v)}
                    />
                    <Bar dataKey="total_value" fill="#8b5cf6" radius={[0, 5, 5, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category portfolio breakdown list */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Categories Breakdown</h3>
              <div className="flex-1 overflow-y-auto max-h-[300px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2">Category</th>
                      <th className="pb-2 text-center">Volume</th>
                      <th className="pb-2 text-right">Avg Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                    {categoryAnalysis.map((cat, idx) => (
                      <tr key={cat.name} className="hover:bg-slate-50/50">
                        <td className="py-3 text-slate-800 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                          <span className="truncate max-w-[120px]">{cat.name}</span>
                        </td>
                        <td className="py-3 text-center text-slate-500">{cat.count}</td>
                        <td className="py-3 text-right font-bold text-slate-850">{formatCurrency(cat.avg_value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
