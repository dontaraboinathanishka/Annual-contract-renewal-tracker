import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PlusSquare, 
  BarChart3, 
  Settings, 
  LogOut, 
  ShieldAlert,
  Award,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout, isAdmin, isRM } = useAuth();

  const navigation = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard, roles: ['Admin', 'Relationship Manager', 'Management'] },
    { name: 'Contracts', to: '/contracts', icon: FileText, roles: ['Admin', 'Relationship Manager', 'Management'] },
    { name: 'New Contract', to: '/contracts/new', icon: PlusSquare, roles: ['Admin', 'Relationship Manager'] },
    { name: 'Reports & Analytics', to: '/reports', icon: BarChart3, roles: ['Admin', 'Relationship Manager', 'Management'] },
    { name: 'Admin Panel', to: '/admin', icon: Settings, roles: ['Admin'] },
  ];

  const filteredNavigation = navigation.filter(
    item => item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out border-r border-slate-800 lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header/Branding */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <NavLink to="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
            <div className="bg-brand-600 p-2 rounded-xl text-white shadow-lg shadow-brand-600/30">
              <Award className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight">OXYGEN SPORTS</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Contract Tracker</p>
            </div>
          </NavLink>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200
                ${isActive 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5 shrink-0 stroke-[2]" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-brand-400 border border-slate-700/60 shadow-sm shrink-0">
              {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-slate-200 truncate">{user?.name}</h2>
              <span className="inline-flex items-center px-2 py-0.5 mt-0.5 rounded text-[10px] font-bold tracking-wider bg-slate-800 text-brand-300 uppercase">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 flex w-full items-center justify-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-900/60 hover:bg-rose-500/10 rounded-xl transition-all duration-200 border border-slate-800 hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4 stroke-[2]" />
            LOG OUT SESSION
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
