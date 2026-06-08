import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  HelpCircle,
  FileCheck,
  Calendar,
  DollarSign
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ContractForm = () => {
  const { id } = useParams(); // present only in edit mode
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { isAdmin, isRM } = useAuth();

  // Initial Empty Form State
  const initialFormState = {
    contract_id: '',
    academy_name: '',
    equipment_category: '',
    contract_value: '',
    start_date: '',
    end_date: '',
    renewal_date: '',
    price_revision: 0,
    relationship_manager: '',
    contact_person: '',
    contact_number: '',
    email: '',
    notes: '',
    status: 'Active'
  };

  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Static options
  const managers = ['John Doe', 'Jane Smith'];
  const categories = [
    'Football Equipment', 
    'Tennis & Rackets', 
    'Cricket Gear', 
    'Basketball & Nets', 
    'Aquatic Gear', 
    'Track & Field', 
    'Gymnastics Mats'
  ];
  const statuses = ['Active', 'Expired', 'Renewed', 'Pending'];

  // Enforce security authorization
  useEffect(() => {
    if (!isAdmin && !isRM) {
      alert('Forbidden. You do not have edit credentials.');
      navigate('/');
    }
  }, [isAdmin, isRM]);

  // Load contract details if in Edit Mode, or generate ID if in Create Mode
  useEffect(() => {
    const loadData = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const data = await api.contracts.get(id);
          setForm({
            ...data.contract,
            notes: data.contract.notes || ''
          });
        } catch (err) {
          setError('Failed to retrieve contract data.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        // Auto-generate a dummy Contract ID on creation page load
        const uniqueNum = Math.floor(1000 + Math.random() * 9000);
        setForm(prev => ({
          ...prev,
          contract_id: `CTR-2026-${uniqueNum}`
        }));
      }
    };
    loadData();
  }, [id, isEditMode]);

  const validateForm = () => {
    const errors = {};
    if (!form.contract_id.trim()) errors.contract_id = 'Contract ID is required';
    if (!form.academy_name.trim()) errors.academy_name = 'Academy name is required';
    if (!form.equipment_category) errors.equipment_category = 'Select an equipment category';
    
    const val = parseFloat(form.contract_value);
    if (isNaN(val) || val <= 0) errors.contract_value = 'Contract value must be a positive number';
    
    if (!form.start_date) errors.start_date = 'Start date is required';
    if (!form.end_date) errors.end_date = 'End date is required';
    if (!form.renewal_date) errors.renewal_date = 'Renewal date is required';
    
    if (form.start_date && form.end_date && new Date(form.start_date) >= new Date(form.end_date)) {
      errors.end_date = 'End date must be after the start date';
    }

    if (form.end_date && form.renewal_date && new Date(form.end_date) > new Date(form.renewal_date)) {
      errors.renewal_date = 'Renewal date must be on or after the end date';
    }

    if (form.price_revision < 0 || form.price_revision > 100) {
      errors.price_revision = 'Price revision must be between 0% and 100%';
    }

    if (!form.relationship_manager) errors.relationship_manager = 'Relationship manager is required';
    if (!form.contact_person.trim()) errors.contact_person = 'Contact person is required';
    if (!form.contact_number.trim()) errors.contact_number = 'Contact number is required';
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailPattern.test(form.email)) {
      errors.email = 'Enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error on change
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Validation failed. Please correct form fields below.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.contracts.update(id, form);
        alert('Contract updated successfully!');
      } else {
        await api.contracts.create(form);
        alert('Contract created successfully!');
      }
      navigate('/contracts');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while saving contract.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    if (window.confirm('Reset form inputs? All unsaved edits will be discarded.')) {
      if (isEditMode) {
        // reload from original params
        navigate(0);
      } else {
        setForm(initialFormState);
        setValidationErrors({});
        // Re-generate ID
        const uniqueNum = Math.floor(1000 + Math.random() * 9000);
        setForm(prev => ({
          ...prev,
          contract_id: `CTR-2026-${uniqueNum}`
        }));
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6 fade-in">
      {/* Navigation and Title header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {isEditMode ? 'Modify Contract Details' : 'Register New Contract'}
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            {isEditMode ? `Updating database registry for ID: ${form.contract_id}` : 'Fill in the information blocks below to seed contract records'}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm font-semibold">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main input form */}
      <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-8">
        
        {/* Section 1: Contract Identifiers */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-l-4 border-brand-500 pl-2">
            1. Contract Identification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contract ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Contract ID</label>
              <input
                type="text"
                name="contract_id"
                disabled={isEditMode}
                value={form.contract_id}
                onChange={handleInputChange}
                className={`block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-semibold font-mono ${
                  isEditMode ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100' : 'bg-white text-slate-700'
                }`}
              />
              {validationErrors.contract_id && <p className="text-[11px] text-rose-600 font-bold">{validationErrors.contract_id}</p>}
            </div>

            {/* Academy Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Academy Name</label>
              <input
                type="text"
                name="academy_name"
                required
                placeholder="e.g. Apex Football Academy"
                value={form.academy_name}
                onChange={handleInputChange}
                className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-medium text-slate-700 bg-white"
              />
              {validationErrors.academy_name && <p className="text-[11px] text-rose-600 font-bold">{validationErrors.academy_name}</p>}
            </div>

            {/* Equipment Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Equipment Category</label>
              <select
                name="equipment_category"
                value={form.equipment_category}
                onChange={handleInputChange}
                className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-medium text-slate-600 bg-white"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {validationErrors.equipment_category && <p className="text-[11px] text-rose-600 font-bold">{validationErrors.equipment_category}</p>}
            </div>

            {/* Relationship Manager */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Relationship Manager</label>
              <select
                name="relationship_manager"
                value={form.relationship_manager}
                onChange={handleInputChange}
                className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-medium text-slate-600 bg-white"
              >
                <option value="">Select Manager</option>
                {managers.map(mgr => (
                  <option key={mgr} value={mgr}>{mgr}</option>
                ))}
              </select>
              {validationErrors.relationship_manager && <p className="text-[11px] text-rose-600 font-bold">{validationErrors.relationship_manager}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Values & Revisions */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-l-4 border-brand-500 pl-2">
            2. Commercial Value & Revisions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contract Value */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                Contract Value (USD)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="number"
                  name="contract_value"
                  placeholder="e.g. 50000"
                  value={form.contract_value}
                  onChange={handleInputChange}
                  className="block w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-medium text-slate-700 bg-white"
                />
              </div>
              {validationErrors.contract_value && <p className="text-[11px] text-rose-600 font-bold">{validationErrors.contract_value}</p>}
            </div>

            {/* Price Revision Percentage */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Price Revision %
              </label>
              <input
                type="number"
                step="0.1"
                name="price_revision"
                placeholder="e.g. 5"
                value={form.price_revision}
                onChange={handleInputChange}
                className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-semibold text-slate-700 bg-white"
              />
              {validationErrors.price_revision && <p className="text-[11px] text-rose-600 font-bold">{validationErrors.price_revision}</p>}
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleInputChange}
                className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-bold text-slate-700 bg-white"
              >
                {statuses.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Time Periods */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-l-4 border-brand-500 pl-2">
            3. Timeline Calendar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleInputChange}
                className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-medium text-slate-700 bg-white"
              />
              {validationErrors.start_date && <p className="text-[11px] text-rose-600 font-bold">{validationErrors.start_date}</p>}
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">End Date / Expiry</label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleInputChange}
                className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-medium text-slate-700 bg-white"
              />
              {validationErrors.end_date && <p className="text-[11px] text-rose-600 font-bold">{validationErrors.end_date}</p>}
            </div>

            {/* Renewal Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                Target Renewal Date
              </label>
              <input
                type="date"
                name="renewal_date"
                value={form.renewal_date}
                onChange={handleInputChange}
                className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-medium text-slate-700 bg-white"
              />
              {validationErrors.renewal_date && <p className="text-[11px] text-rose-600 font-bold">{validationErrors.renewal_date}</p>}
            </div>
          </div>
        </div>

        {/* Section 4: Contact & Notes */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-l-4 border-brand-500 pl-2">
            4. Academy Contact & Notes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Person */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Contact Person</label>
              <input
                type="text"
                name="contact_person"
                placeholder="e.g. Sarah Connor"
                value={form.contact_person}
                onChange={handleInputChange}
                className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-medium text-slate-700 bg-white"
              />
              {validationErrors.contact_person && <p className="text-[11px] text-rose-600 font-bold">{validationErrors.contact_person}</p>}
            </div>

            {/* Contact Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Contact Number</label>
              <input
                type="text"
                name="contact_number"
                placeholder="e.g. +1-555-0199"
                value={form.contact_number}
                onChange={handleInputChange}
                className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-medium text-slate-700 bg-white"
              />
              {validationErrors.contact_number && <p className="text-[11px] text-rose-600 font-bold">{validationErrors.contact_number}</p>}
            </div>

            {/* Contact Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Contact Email</label>
              <input
                type="email"
                name="email"
                placeholder="e.g. sarah@vanguard.com"
                value={form.email}
                onChange={handleInputChange}
                className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-medium text-slate-700 bg-white"
              />
              {validationErrors.email && <p className="text-[11px] text-rose-600 font-bold">{validationErrors.email}</p>}
            </div>
          </div>

          {/* Notes Area */}
          <div className="space-y-1.5 mt-6">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Notes & Provisions</label>
            <textarea
              name="notes"
              rows={4}
              placeholder="Supply clauses, items count, custom delivery terms..."
              value={form.notes}
              onChange={handleInputChange}
              className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-medium text-slate-700 bg-white"
            ></textarea>
          </div>
        </div>

        {/* Action Panel Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-50">
          <button
            type="button"
            onClick={handleResetForm}
            className="px-5 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> RESET FORM
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-brand-600/10 hover:shadow-lg disabled:opacity-50 transition-all"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-4 h-4" /> 
                {isEditMode ? 'UPDATE CONTRACT' : 'SAVE CONTRACT'}
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ContractForm;
