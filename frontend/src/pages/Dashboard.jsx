import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  PlusSquare, 
  TrendingUp, 
  Activity,
  Calendar,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { api } from '../utils/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardStats = await api.contracts.dashboard();
      setData(dashboardStats);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve dashboard metrics. Verify the server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-xl"></div>
          <div className="h-96 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-semibold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const { metrics, upcomingRenewals, recentActivities, statusDistribution, monthlyTrend } = data;

  // Pie chart config
  const COLORS = {
    Active: '#10b981',   // Emerald
    Renewed: '#3b82f6',  // Blue
    Expired: '#f43f5e',  // Rose
    Pending: '#f59e0b',  // Amber
  };

  const chartData = statusDistribution.map(item => ({
    ...item,
    color: COLORS[item.name] || '#64748b'
  }));

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
        {/* Abstract Background Design */}
        <div className="absolute right-0 top-0 opacity-10 translate-x-20 -translate-y-10 w-96 h-96 rounded-full border-[32px] border-brand-500"></div>
        <div className="space-y-1 relative z-10">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Supply Contracts Overview</h2>
          <p className="text-slate-400 text-xs md:text-sm font-medium">Monitoring Oxygen Sports operations as of reference date: <span className="text-white font-semibold">June 8, 2026</span></p>
        </div>
        <button
          onClick={() => navigate('/contracts/new')}
          className="relative z-10 flex items-center gap-2 px-4.5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-600/20 hover:shadow-lg transition-all"
        >
          <PlusSquare className="w-4 h-4" />
          CREATE CONTRACT
        </button>
      </div>

      {/* Metrics Card Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Total Contracts" 
          value={metrics.total} 
          icon={FileText} 
          colorClass="brand"
          subtext="Lifetime active & archive"
        />
        <StatCard 
          title="Active Contracts" 
          value={metrics.active} 
          icon={CheckCircle} 
          colorClass="emerald"
          subtext="Supplying academies"
        />
        <StatCard 
          title="Expiring Soon" 
          value={metrics.expiringSoon} 
          icon={AlertTriangle} 
          colorClass="rose"
          subtext="Within next 90 days"
        />
        <StatCard 
          title="Renewed Contracts" 
          value={metrics.renewed} 
          icon={TrendingUp} 
          colorClass="blue"
          subtext="Extended for next term"
        />
        <StatCard 
          title="Expired Contracts" 
          value={metrics.expired} 
          icon={Clock} 
          colorClass="amber"
          subtext="Awaiting renewal / closed"
        />
      </div>

      {/* Analytics Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Renewal Value and Volume Trend</h3>
            <p className="text-xs text-slate-400">Projected contract values and counts expiring by calendar month</p>
          </div>
          <div className="h-72">
            {monthlyTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                    labelClassName="text-slate-400 text-xs font-semibold"
                    formatter={(value, name) => name === 'value' ? [formatCurrency(value), 'Value'] : [value, 'Volume']}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area yAxisId="left" type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" name="Value" />
                  <Bar yAxisId="right" dataKey="count" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={20} name="Volume" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Contract Distribution</h3>
            <p className="text-xs text-slate-400 font-medium">Breakdown of contract statuses</p>
          </div>
          
          <div className="h-56 relative my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-extrabold text-slate-800">{metrics.total}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contracts</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
            {chartData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate leading-none">{entry.name}</p>
                  <span className="text-[10px] text-slate-400 font-bold">{entry.value} ({Math.round(entry.value/metrics.total*100) || 0}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expiry alerts and Recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming Renewals Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-5 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Upcoming Renewals</h3>
              <p className="text-xs text-slate-400">Contracts requiring immediate renegotiation (90 Days window)</p>
            </div>
            <button
              onClick={() => navigate('/contracts')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-0.5"
            >
              All contracts <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            {upcomingRenewals.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium">No upcoming renewals found</p>
                <p className="text-xs">No active contracts are within their 90-day expiry threshold.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 pr-4">Academy</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Contract Value</th>
                    <th className="py-3 px-4">Manager</th>
                    <th className="py-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {upcomingRenewals.map((ctr) => (
                    <tr key={ctr.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-700">
                      <td className="py-3.5 pr-4 max-w-[150px] truncate text-slate-800">{ctr.academy_name}</td>
                      <td className="py-3.5 px-4 font-mono text-rose-600 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-500 stroke-[2]" />
                        {ctr.end_date}
                      </td>
                      <td className="py-3.5 px-4">{formatCurrency(ctr.contract_value)}</td>
                      <td className="py-3.5 px-4 text-slate-500">{ctr.relationship_manager}</td>
                      <td className="py-3.5 pl-4 text-right">
                        <button
                          onClick={() => navigate(`/contracts/${ctr.id}`)}
                          className="p-1.5 text-brand-600 hover:text-white bg-brand-50 hover:bg-brand-600 rounded-lg transition-colors border border-brand-100 hover:border-brand-600 inline-flex items-center"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Audit / Action Logs Timeline */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">System Activity Log</h3>
            <p className="text-xs text-slate-400 font-medium">Real-time contract audit logs feed</p>
          </div>

          <div className="flex-1 flow-root overflow-y-auto max-h-[300px] pr-2">
            <ul className="-mb-8">
              {recentActivities.map((log, index) => (
                <li key={log.id}>
                  <div className="relative pb-8">
                    {index !== recentActivities.length - 1 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true"></span>
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-brand-600 stroke-[2]" />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5">
                        <p className="text-xs font-semibold text-slate-800">
                          {log.action}{' '}
                          {log.contract_id && (
                            <span className="font-mono text-[10px] font-bold text-brand-600 bg-brand-50 border border-brand-100 rounded px-1.5 py-0.5 ml-1">
                              {log.contract_id}
                            </span>
                          )}
                        </p>
                        <div className="text-[10px] text-slate-400 font-semibold mt-1 flex justify-between">
                          <span>By {log.performed_by}</span>
                          <span className="font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
