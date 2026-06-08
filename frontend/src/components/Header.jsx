import React, { useState, useEffect, useRef } from 'react';
import { Menu, Shield, Palette } from 'lucide-react';
import AlertCenter from './AlertCenter';
import { useAuth } from '../context/AuthContext';

const themes = {
  blue: {
    name: 'Ocean Blue',
    color: '#3b82f6',
    vars: {
      '50': '239 246 255',
      '100': '219 234 254',
      '200': '191 219 254',
      '300': '147 197 253',
      '400': '96 165 250',
      '500': '59 130 246',
      '600': '37 99 235',
      '700': '29 78 216',
      '800': '30 64 175',
      '900': '30 58 138',
      '950': '23 37 84'
    }
  },
  emerald: {
    name: 'Forest Emerald',
    color: '#10b981',
    vars: {
      '50': '236 253 245',
      '100': '209 250 229',
      '200': '167 243 208',
      '300': '110 231 183',
      '400': '52 211 153',
      '500': '16 185 129',
      '600': '5 150 105',
      '700': '4 120 87',
      '800': '6 95 70',
      '900': '6 78 59',
      '950': '2 48 32'
    }
  },
  violet: {
    name: 'Royal Violet',
    color: '#8b5cf6',
    vars: {
      '50': '245 243 255',
      '100': '237 233 254',
      '200': '221 214 254',
      '300': '196 181 253',
      '400': '167 139 250',
      '500': '139 92 246',
      '600': '124 58 237',
      '700': '109 40 217',
      '800': '91 33 182',
      '900': '76 29 149',
      '950': '46 16 101'
    }
  },
  amber: {
    name: 'Sunset Gold',
    color: '#f59e0b',
    vars: {
      '50': '254 243 199',
      '100': '253 230 138',
      '200': '252 211 77',
      '300': '251 191 36',
      '400': '245 158 11',
      '500': '217 119 6',
      '600': '180 83 9',
      '700': '146 64 14',
      '800': '120 53 4',
      '900': '120 53 4',
      '950': '69 26 3'
    }
  }
};

const Header = ({ onMenuClick, title = 'Overview' }) => {
  const { user } = useAuth();
  const [themeOpen, setThemeOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState('blue');
  const dropdownRef = useRef(null);

  const applyTheme = (themeName) => {
    const root = document.documentElement;
    const colors = themes[themeName]?.vars || themes.blue.vars;
    Object.entries(colors).forEach(([key, val]) => {
      root.style.setProperty(`--color-brand-${key}`, val);
    });
    localStorage.setItem('oxygen_theme', themeName);
    setActiveTheme(themeName);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('oxygen_theme') || 'blue';
    applyTheme(savedTheme);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-100 bg-white px-6 shadow-sm sticky top-0 z-30">
      {/* Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-500 hover:text-slate-700 hover:bg-slate-50 p-2 rounded-xl border border-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5 stroke-[2]" />
        </button>
        <div className="hidden sm:block">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h1>
        </div>
      </div>

      {/* Right Controls: Roles badge & Notifications */}
      <div className="flex items-center gap-4">
        {/* Role label badge */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
          <Shield className="w-4 h-4 text-brand-600 stroke-[2.5]" />
          <span className="text-xs font-semibold text-slate-500">Security Clearance:</span>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            {user?.role}
          </span>
        </div>

        {/* Dynamic Theme Switcher Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors border border-slate-100 focus:outline-none"
            title="Switch palette theme"
          >
            <Palette className="w-5 h-5 stroke-[2]" />
          </button>
          
          {themeOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden divide-y divide-slate-50 py-1 fade-in">
              {Object.entries(themes).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => {
                    applyTheme(key);
                    setThemeOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors ${
                    activeTheme === key ? 'text-brand-700 font-extrabold' : ''
                  }`}
                >
                  <span 
                    className="w-3.5 h-3.5 rounded-full border border-black/5 shrink-0" 
                    style={{ backgroundColor: t.color }}
                  />
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Alert Notifications System */}
        <AlertCenter />
        
        {/* User Mini Avatar */}
        <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
          {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'U'}
        </div>
      </div>
    </header>
  );
};

export default Header;
