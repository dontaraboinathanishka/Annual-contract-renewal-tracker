import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound, Mail, AlertCircle, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Incorrect credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setError('');
    setIsSubmitting(true);
    try {
      await login(demoEmail, 'password123');
      navigate('/');
    } catch (err) {
      setError('Demo login failed. Make sure server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950">
      
      {/* Brand & Theme Left panel */}
      <div className="flex-1 bg-gradient-to-br from-brand-900 via-brand-950 to-slate-950 flex flex-col justify-between p-8 md:p-16 text-white relative overflow-hidden">
        {/* Decorative Grid Patterns */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Brand Banner */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-brand-600 p-2.5 rounded-xl shadow-lg shadow-brand-500/20">
            <Award className="w-6 h-6 text-white stroke-[2]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">OXYGEN SPORTS</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Supply Operations</p>
          </div>
        </div>

        {/* Brand Message */}
        <div className="my-auto py-12 space-y-6 relative z-10 max-w-lg">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
            Enterprise Client Suite
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Academy Annual <br/>
            <span className="bg-gradient-to-r from-brand-400 to-blue-300 bg-clip-text text-transparent">
              Contract Renewal
            </span> <br/>
            Tracker.
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed">
            Monitor and manage commercial sports academy contracts. Automate renewal notices, optimize price revision adjustments, and coordinate relationship manager operations.
          </p>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 relative z-10 font-medium">
          &copy; {new Date().getFullYear()} Oxygen Sports Inc. All rights reserved.
        </div>
      </div>

      {/* Login form Right panel */}
      <div className="flex-1 bg-white flex items-center justify-center p-8 md:p-16 border-t md:border-t-0 md:border-l border-slate-100">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Security Portal</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Sign in to manage contract revisions and system analytics.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm font-semibold animate-pulse">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4.5 h-4.5 text-slate-400 stroke-[2]" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@oxygensports.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Password
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => { e.preventDefault(); alert("Contact an Administrator to reset credentials."); }}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <KeyRound className="w-4.5 h-4.5 text-slate-400 stroke-[2]" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="remember_me" className="ml-2.5 block text-sm font-semibold text-slate-600 cursor-pointer select-none">
                Remember my session details
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 shadow-md shadow-brand-600/10 hover:shadow-lg disabled:opacity-50 transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'SECURE LOG IN'
              )}
            </button>
          </form>

          {/* Quick Demo Access presets */}
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Quick Identity Selection</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDemoLogin('admin@oxygensports.com')}
                disabled={isSubmitting}
                className="flex flex-col items-center p-2.5 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 rounded-xl text-center transition-all group"
              >
                <Shield className="w-4.5 h-4.5 text-slate-500 group-hover:text-brand-600 stroke-[2] mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 group-hover:text-brand-900 uppercase">Admin</span>
              </button>
              <button
                onClick={() => handleDemoLogin('rm@oxygensports.com')}
                disabled={isSubmitting}
                className="flex flex-col items-center p-2.5 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 rounded-xl text-center transition-all group"
              >
                <Mail className="w-4.5 h-4.5 text-slate-500 group-hover:text-brand-600 stroke-[2] mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 group-hover:text-brand-900 uppercase">Manager</span>
              </button>
              <button
                onClick={() => handleDemoLogin('mgmt@oxygensports.com')}
                disabled={isSubmitting}
                className="flex flex-col items-center p-2.5 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 rounded-xl text-center transition-all group"
              >
                <KeyRound className="w-4.5 h-4.5 text-slate-500 group-hover:text-brand-600 stroke-[2] mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 group-hover:text-brand-900 uppercase">Mgmt</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
