import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Paperclip,
  Activity, 
  ShieldAlert,
  Percent,
  Download,
  AlertTriangle,
  History
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const ContractDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { isAdmin, isRM } = useAuth();

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.contracts.get(id);
      setData(res);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve contract details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete contract ${data?.contract?.contract_id}?`)) {
      return;
    }
    try {
      await api.contracts.delete(id);
      alert('Contract deleted successfully');
      navigate('/contracts');
    } catch (err) {
      alert(err.message || 'Deletion failed.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-xl"></div>
          <div className="h-96 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-semibold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>{error || 'Contract data not found.'}</span>
        </div>
      </div>
    );
  }

  const { contract, auditLogs } = data;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Mock related documents
  const documents = [
    { name: `Signed_Agreement_${contract.contract_id}.pdf`, size: '2.4 MB', type: 'PDF' },
    { name: 'Equipment_Price_Inventory_V2.xlsx', size: '1.1 MB', type: 'Excel' },
    { name: 'Addendum_Renewal_Clauses_Signed.docx', size: '820 KB', type: 'Word' }
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8 fade-in">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/contracts')}
            className="p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Contract Registry</h2>
              <span className="font-mono text-xs bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-slate-500 font-bold">
                {contract.contract_id}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Detailed audit and commercial overview for {contract.academy_name}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {(isAdmin || isRM) && (
            <button
              onClick={() => navigate(`/contracts/edit/${contract.id}`)}
              className="flex items-center gap-1.5 px-4 py-2 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl transition-colors"
            >
              <Edit className="w-4 h-4 stroke-[2]" /> EDIT REGISTRY
            </button>
          )}
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-4 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4 stroke-[2]" /> DELETE
            </button>
          )}
        </div>
      </div>

      {/* Main grids layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: General Info Card Blocks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Commercial overview */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Commercial Overview</h3>
              <StatusBadge status={contract.status} />
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Box 1 */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600 border border-brand-100 h-10 w-10 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Contract Annual Value</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">{formatCurrency(contract.contract_value)}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100 h-10 w-10 flex items-center justify-center shrink-0">
                    <Percent className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Price Revision Rate</p>
                    <p className="text-lg font-bold text-slate-800 mt-1">{contract.price_revision}%</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl text-slate-500 border border-slate-200/60 h-10 w-10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Equipment Category</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">{contract.equipment_category}</p>
                  </div>
                </div>
              </div>

              {/* Box 2 */}
              <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8">
                <div className="flex gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-500 border border-slate-100 shrink-0">
                    <Calendar className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</p>
                    <p className="text-sm font-semibold text-slate-800">{contract.start_date}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-500 border border-rose-100 shrink-0">
                    <Calendar className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date / Expiry</p>
                    <p className="text-sm font-semibold text-slate-800">{contract.end_date}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 bg-brand-50 rounded-lg text-brand-500 border border-brand-100 shrink-0">
                    <Calendar className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Renegotiation Target Date</p>
                    <p className="text-sm font-semibold text-slate-850 font-bold text-brand-700">{contract.renewal_date}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {contract.notes && (
              <div className="px-6 pb-6 pt-4 border-t border-slate-50 bg-slate-50/20">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Registry Provisions / Notes</h4>
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-600 font-medium whitespace-pre-line leading-relaxed">
                  {contract.notes}
                </div>
              </div>
            )}
          </div>

          {/* Contact Details card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-l-4 border-brand-500 pl-2">
              Academy Primary Contacts
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-xl text-slate-500">
                  <User className="w-4.5 h-4.5 stroke-[2]" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Contact Person</p>
                  <p className="text-xs font-bold text-slate-700 mt-1">{contract.contact_person}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-xl text-slate-500">
                  <Phone className="w-4.5 h-4.5 stroke-[2]" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Contact Number</p>
                  <p className="text-xs font-bold text-slate-700 mt-1">{contract.contact_number}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-xl text-slate-500">
                  <Mail className="w-4.5 h-4.5 stroke-[2]" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Email Address</p>
                  <p className="text-xs font-bold text-slate-700 mt-1 truncate max-w-[170px]">{contract.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Renewal History / Milestones */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-l-4 border-brand-500 pl-2">
              <History className="w-4.5 h-4.5 text-brand-600 stroke-[2.5]" />
              Renewal Term Milestones
            </h3>
            <div className="pt-2">
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex flex-col items-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-100 flex shrink-0"></span>
                  <span className="h-12 w-0.5 bg-slate-200"></span>
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-slate-800 font-bold">Contract Term Commenced</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Start date set as {contract.start_date}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex flex-col items-center">
                  <span className={`w-3.5 h-3.5 rounded-full border-2 border-white ring-2 flex shrink-0 ${
                    contract.status === 'Expired' ? 'bg-rose-500 ring-rose-100' : 'bg-brand-500 ring-brand-100'
                  }`}></span>
                  <span className="h-12 w-0.5 bg-slate-200"></span>
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-slate-800 font-bold">Contract Expiry Boundary</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Boundary set as {contract.end_date}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex flex-col items-center">
                  <span className={`w-3.5 h-3.5 rounded-full border-2 border-white ring-2 flex shrink-0 ${
                    contract.status === 'Renewed' ? 'bg-emerald-500 ring-emerald-100' : 'bg-slate-300 ring-slate-100'
                  }`}></span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-800 font-bold">Renegotiation Boundary Target</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Target boundary is set as {contract.renewal_date}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Documents and System Log timelines */}
        <div className="space-y-6">
          {/* Assignment Panel */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-24 h-24 rounded-full bg-slate-800 opacity-30"></div>
            <div className="space-y-1 relative z-10">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Assigned Executive</p>
              <h4 className="text-base font-bold tracking-tight">{contract.relationship_manager}</h4>
              <p className="text-[10px] text-brand-300 font-semibold uppercase">Oxygen Relationship Manager</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-slate-850 flex items-center justify-center text-brand-400 font-bold text-base border border-slate-800 relative z-10 shrink-0">
              {contract.relationship_manager.split(' ').map(n=>n[0]).join('')}
            </div>
          </div>

          {/* Related Documents list */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-l-4 border-brand-500 pl-2">
              <Paperclip className="w-4.5 h-4.5 text-brand-600 stroke-[2.5]" />
              Related Documents
            </h3>
            
            <div className="space-y-3 pt-2">
              {documents.map((doc, i) => (
                <div key={i} className="p-3 border border-slate-100 hover:border-slate-200 rounded-xl flex items-center justify-between text-xs font-semibold group transition-all">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-slate-700 truncate pr-2" title={doc.name}>{doc.name}</p>
                      <span className="text-[9px] text-slate-400 font-bold">{doc.size} &bull; {doc.type}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert(`Mock downloading ${doc.name}`)}
                    className="p-1.5 text-slate-400 hover:text-brand-600 bg-slate-50 hover:bg-brand-50 border border-slate-100 hover:border-brand-200 rounded-lg shrink-0 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Registry Activity Log timeline */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-l-4 border-brand-500 pl-2">
              <Activity className="w-4.5 h-4.5 text-brand-600 stroke-[2.5]" />
              Registry Log Trails
            </h3>

            <div className="flow-root pt-2 overflow-y-auto max-h-[300px] pr-2">
              <ul className="-mb-8">
                {auditLogs.map((log, index) => (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {index !== auditLogs.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true"></span>
                      )}
                      <div className="relative flex space-x-3 text-xs font-semibold">
                        <div>
                          <span className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-slate-500 stroke-[2]" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5">
                          <p className="text-slate-700 leading-snug">{log.action}</p>
                          <div className="text-[10px] text-slate-400 font-semibold mt-1 flex justify-between">
                            <span>By {log.performed_by}</span>
                            <span className="font-mono">{new Date(log.timestamp).toLocaleDateString()}</span>
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
    </div>
  );
};

export default ContractDetails;
