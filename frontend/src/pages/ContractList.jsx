import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Edit, 
  Trash2, 
  Filter, 
  X, 
  AlertTriangle,
  PlusSquare,
  FileDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const ContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [manager, setManager] = useState('');
  const [category, setCategory] = useState('');
  
  const [sortBy, setSortBy] = useState('end_date');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Static options for dropdown filters
  const [managers, setManagers] = useState(['John Doe', 'Jane Smith']);
  const [categories, setCategories] = useState([
    'Football Equipment', 
    'Tennis & Rackets', 
    'Cricket Gear', 
    'Basketball & Nets', 
    'Aquatic Gear', 
    'Track & Field', 
    'Gymnastics Mats'
  ]);

  const { isAdmin, isRM } = useAuth();
  const navigate = useNavigate();

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await api.contracts.list({
        page,
        limit,
        search,
        status,
        manager,
        category,
        sortBy,
        sortOrder
      });
      setContracts(data.contracts || []);
      setTotalPages(data.pagination.totalPages || 1);
      setTotalItems(data.pagination.totalItems || 0);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch contracts. Verify application API status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [page, status, manager, category, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchContracts();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
    setPage(1);
  };

  const handleDeleteContract = async (id, contractId) => {
    if (!window.confirm(`Are you sure you want to permanently delete contract ${contractId}?`)) {
      return;
    }
    try {
      await api.contracts.delete(id);
      alert('Contract deleted successfully');
      fetchContracts();
    } catch (err) {
      alert(err.message || 'Deletion failed.');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setManager('');
    setCategory('');
    setSortBy('end_date');
    setSortOrder('ASC');
    setPage(1);
  };

  // Helper sorting icon indicator
  const renderSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'ASC' ? 
      <ChevronUp className="w-4 h-4 ml-1 inline text-brand-600 stroke-[2.5]" /> : 
      <ChevronDown className="w-4 h-4 ml-1 inline text-brand-600 stroke-[2.5]" />;
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 fade-in">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Contract Management Dashboard</h2>
          <p className="text-sm text-slate-400 font-medium">Search, filter, and modify commercial supply agreements</p>
        </div>
        {(isAdmin || isRM) && (
          <button
            onClick={() => navigate('/contracts/new')}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-600/10 transition-all hover:shadow-lg"
          >
            <PlusSquare className="w-4.5 h-4.5" />
            NEW CONTRACT
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400 stroke-[2]" />
            <input
              type="text"
              placeholder="Search by academy name or contract ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-medium transition-all"
            />
          </div>
          
          <div className="flex gap-2.5">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
            >
              Search
            </button>
            {(search || status || manager || category) && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <X className="w-4 h-4" /> Reset
              </button>
            )}
          </div>
        </form>

        {/* Dropdown filters block */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-50">
          {/* Filter Status */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:border-brand-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Renewed">Renewed</option>
              <option value="Expired">Expired</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Filter RM */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Relationship Manager</label>
            <select
              value={manager}
              onChange={(e) => { setManager(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:border-brand-500 bg-white"
            >
              <option value="">All Managers</option>
              {managers.map(mgr => (
                <option key={mgr} value={mgr}>{mgr}</option>
              ))}
            </select>
          </div>

          {/* Filter Category */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:border-brand-500 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid Table container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between min-h-[480px]">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-sm font-semibold text-slate-400">Loading contracts details...</p>
            </div>
          ) : error ? (
            <div className="py-12 px-6 text-center text-rose-600">
              <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-rose-500" />
              <p className="font-semibold">{error}</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No contracts found</p>
              <p className="text-xs">Adjust your search parameters or add a new contract.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider select-none">
                  <th className="py-4 px-6 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('contract_id')}>
                    ID {renderSortIcon('contract_id')}
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('academy_name')}>
                    Academy Name {renderSortIcon('academy_name')}
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('equipment_category')}>
                    Category {renderSortIcon('equipment_category')}
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:bg-slate-100 text-right" onClick={() => handleSort('contract_value')}>
                    Value {renderSortIcon('contract_value')}
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('end_date')}>
                    Renewal/End Date {renderSortIcon('end_date')}
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:bg-slate-100 text-center" onClick={() => handleSort('price_revision')}>
                    Revision % {renderSortIcon('price_revision')}
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('relationship_manager')}>
                    Manager {renderSortIcon('relationship_manager')}
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:bg-slate-100 text-center" onClick={() => handleSort('status')}>
                    Status {renderSortIcon('status')}
                  </th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold text-xs">
                {contracts.map((ctr) => (
                  <tr key={ctr.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-[11px] font-bold text-slate-500">{ctr.contract_id}</td>
                    <td className="py-4 px-6 text-slate-800 font-bold max-w-[200px] truncate">{ctr.academy_name}</td>
                    <td className="py-4 px-6 text-slate-500">{ctr.equipment_category}</td>
                    <td className="py-4 px-6 text-right text-slate-800">{formatCurrency(ctr.contract_value)}</td>
                    <td className="py-4 px-6 font-mono text-slate-600">{ctr.end_date}</td>
                    <td className="py-4 px-6 text-center text-slate-500 font-mono">{ctr.price_revision}%</td>
                    <td className="py-4 px-6 text-slate-500 font-medium">{ctr.relationship_manager}</td>
                    <td className="py-4 px-6 text-center">
                      <StatusBadge status={ctr.status} />
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => navigate(`/contracts/${ctr.id}`)}
                        title="View details"
                        className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors border border-transparent hover:border-brand-150 inline-flex"
                      >
                        <Eye className="w-4 h-4 stroke-[2]" />
                      </button>
                      {(isAdmin || isRM) && (
                        <button
                          onClick={() => navigate(`/contracts/edit/${ctr.id}`)}
                          title="Edit contract"
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors border border-transparent hover:border-amber-150 inline-flex"
                        >
                          <Edit className="w-4 h-4 stroke-[2]" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteContract(ctr.id, ctr.contract_id)}
                          title="Delete contract"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-150 inline-flex"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2]" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Section */}
        {!loading && contracts.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4.5 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-400 font-semibold">
              Showing <span className="font-bold text-slate-600">{contracts.length}</span> of <span className="font-bold text-slate-600">{totalItems}</span> entries
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2]" /> Previous
              </button>
              <div className="flex items-center px-3.5 text-xs font-bold text-slate-500 select-none">
                Page {page} of {totalPages}
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
              >
                Next <ChevronRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractList;
