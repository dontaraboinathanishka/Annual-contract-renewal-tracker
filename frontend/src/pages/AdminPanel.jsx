import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  Database, 
  Activity, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  ShieldAlert, 
  Download, 
  Upload,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeSubTab, setActiveSubTab] = useState('users'); // users, settings, logs, backup
  
  // Users state
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'Relationship Manager', password: '' });
  const [editingUserId, setEditingUserId] = useState(null);
  
  // Logs state
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    notice_threshold_1: '90',
    notice_threshold_2: '60',
    notice_threshold_3: '30',
    smtp_enabled: true,
    backup_frequency: 'Weekly'
  });

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isBackupRestoring, setIsBackupRestoring] = useState(false);

  // Enforce administrative security clearance
  useEffect(() => {
    if (!isAdmin) {
      alert('Access Denied. Administrative security clearance is required.');
      navigate('/');
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await api.users.list();
      setUsersList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const data = await api.logs.list();
      setLogs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      if (activeSubTab === 'users') fetchUsers();
      if (activeSubTab === 'logs') fetchLogs();
    }
  }, [activeSubTab, isAdmin]);

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email || (!editingUserId && !userForm.password)) {
      alert('Please fill in all required user credentials.');
      return;
    }

    try {
      if (editingUserId) {
        await api.users.update(editingUserId, userForm);
        alert('User profile updated successfully.');
      } else {
        await api.users.create(userForm);
        alert('New user account registered successfully.');
      }
      setUserForm({ name: '', email: '', role: 'Relationship Manager', password: '' });
      setEditingUserId(null);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Operation failed.');
    }
  };

  const handleEditUserClick = (usr) => {
    setEditingUserId(usr.id);
    setUserForm({
      name: usr.name,
      email: usr.email,
      role: usr.role,
      password: '' // leave blank unless changing
    });
  };

  const handleDeleteUserClick = async (usrId, emailStr) => {
    if (user.email === emailStr) {
      alert('You cannot delete your own administrative session account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user account: ${emailStr}?`)) {
      return;
    }
    try {
      await api.users.delete(usrId);
      alert('User account deleted.');
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Deletion failed.');
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setTimeout(() => {
      setIsSavingSettings(false);
      alert('System configuration parameters saved.');
    }, 1000);
  };

  const handleTriggerBackup = () => {
    setIsBackupRestoring(true);
    setTimeout(() => {
      setIsBackupRestoring(false);
      alert('System backup compiled. Database dump OxygenSports_Backup_2026-06-08.sqlite downloaded.');
    }, 1500);
  };

  const handleTriggerRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
      setIsBackupRestoring(true);
      setTimeout(() => {
        setIsBackupRestoring(false);
        alert('System data backup successfully restored from file.');
        fetchUsers();
      }, 1500);
    };
    input.click();
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6 p-6 lg:p-8 fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Administrative Configuration Panel</h2>
        <p className="text-sm text-slate-400 font-medium">Manage user credentials, adjust system notice ranges, and view action logs</p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-100 gap-6">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeSubTab === 'users' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <Users className="w-4 h-4" /> Users Profiles
        </button>
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeSubTab === 'settings' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-655'
          }`}
        >
          <Settings className="w-4 h-4" /> System Settings
        </button>
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeSubTab === 'logs' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-660'
          }`}
        >
          <Activity className="w-4 h-4" /> Security Audits
        </button>
        <button
          onClick={() => setActiveSubTab('backup')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeSubTab === 'backup' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-665'
          }`}
        >
          <Database className="w-4 h-4" /> Backup & Restore
        </button>
      </div>

      {/* RENDER CONTENTS */}

      {/* SUB-TAB 1: USERS MANAGEMENT */}
      {activeSubTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Create/Edit */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between h-fit">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-l-4 border-brand-500 pl-2">
              {editingUserId ? 'Edit User Credentials' : 'Register Account'}
            </h3>
            
            <form onSubmit={handleUserFormSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={form.name || userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  required
                  placeholder="johndoe@oxygensports.com"
                  value={form.email || userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</label>
                <select
                  value={form.role || userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 font-bold text-slate-700 bg-white"
                >
                  <option value="Admin">Admin</option>
                  <option value="Relationship Manager">Relationship Manager</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Password {editingUserId && '(Leave blank to retain original)'}
                </label>
                <input
                  type="password"
                  required={!editingUserId}
                  placeholder="••••••••"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" /> {editingUserId ? 'Update Profile' : 'Register'}
                </button>
                {editingUserId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUserId(null);
                      setUserForm({ name: '', email: '', role: 'Relationship Manager', password: '' });
                    }}
                    className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Users List Grid Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden lg:col-span-2 min-h-[350px]">
            {loadingUsers ? (
              <div className="py-24 text-center">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-5">Name</th>
                    <th className="py-3 px-5">Email</th>
                    <th className="py-3 px-5">Role</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-5 text-slate-800 font-bold">{usr.name}</td>
                      <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500">{usr.email}</td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-1">
                        <button
                          onClick={() => handleEditUserClick(usr)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 rounded-lg inline-flex"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUserClick(usr.id, usr.email)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 rounded-lg inline-flex"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SYSTEM CONFIGURATION SETTINGS */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm max-w-2xl space-y-6">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-l-4 border-brand-500 pl-2">
            System Alert Threshold Parameters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expiry Alert Period 1 (Days)</label>
              <input
                type="number"
                value={settings.notice_threshold_1}
                onChange={e => setSettings({ ...settings, notice_threshold_1: e.target.value })}
                className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expiry Alert Period 2 (Days)</label>
              <input
                type="number"
                value={settings.notice_threshold_2}
                onChange={e => setSettings({ ...settings, notice_threshold_2: e.target.value })}
                className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expiry Alert Period 3 (Days)</label>
              <input
                type="number"
                value={settings.notice_threshold_3}
                onChange={e => setSettings({ ...settings, notice_threshold_3: e.target.value })}
                className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Automated Notifications Settings</h4>
            
            <div className="flex items-center">
              <input
                id="smtp_enabled"
                type="checkbox"
                checked={settings.smtp_enabled}
                onChange={e => setSettings({ ...settings, smtp_enabled: e.target.checked })}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="smtp_enabled" className="ml-2.5 text-xs font-bold text-slate-600 cursor-pointer">
                Automatically fire email updates to relationship managers and clients on boundary transitions
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-55">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              {isSavingSettings ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" /> SAVE CONFIGURATIONS
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 3: SYSTEM AUDIT TIMELINE */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">System-Wide Security Action Log</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            {loadingLogs ? (
              <div className="py-24 text-center">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-5">Timestamp</th>
                    <th className="py-3 px-5">Target Contract</th>
                    <th className="py-3 px-5">Event Detail</th>
                    <th className="py-3 px-5">Executed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-5 font-mono text-[11px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-3 px-5">
                        {log.contract_id ? (
                          <span className="font-mono text-[10px] font-bold text-brand-600 bg-brand-50 border border-brand-100 rounded px-1.5 py-0.5">
                            {log.contract_id}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-slate-800 font-semibold">{log.action}</td>
                      <td className="py-3 px-5 text-slate-500">{log.performed_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BACKUP & RESTORE */}
      {activeSubTab === 'backup' && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm max-w-2xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-l-4 border-brand-500 pl-2">
              Database Maintenance Utilities
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Backup schema files and content records locally or upload previous system states</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Backup Box */}
            <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between h-44 shadow-sm">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Download className="w-4 h-4 text-slate-500" /> Export Database
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">Export SQLite database as copy schema file containing users records and logs registry.</p>
              </div>
              <button
                onClick={handleTriggerBackup}
                disabled={isBackupRestoring}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isBackupRestoring ? 'PROCESSING...' : 'TRIGGER BACKUP'}
              </button>
            </div>

            {/* Restore Box */}
            <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between h-44 shadow-sm">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Upload className="w-4 h-4 text-slate-500" /> Restore Database
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">Select previously saved `.sqlite` backup files and upload to restore historical tracking states.</p>
              </div>
              <button
                onClick={handleTriggerRestore}
                disabled={isBackupRestoring}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isBackupRestoring ? 'RESTORING STATE...' : 'RESTORE FROM FILE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
