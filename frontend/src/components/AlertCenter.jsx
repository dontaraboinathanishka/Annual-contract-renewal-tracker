import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Mail, AlertTriangle, AlertCircle, Clock, Check } from 'lucide-react';
import { api } from '../utils/api';

const AlertCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const referenceDate = new Date('2026-06-08');

  const fetchAlerts = async () => {
    try {
      const data = await api.contracts.list({ limit: 100 });
      const contracts = data.contracts || [];
      
      const parsedAlerts = [];

      contracts.forEach((contract) => {
        const endDate = new Date(contract.end_date);
        const diffTime = endDate - referenceDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (contract.status === 'Expired') {
          parsedAlerts.push({
            id: `exp-${contract.id}`,
            contractDbId: contract.id,
            contractId: contract.contract_id,
            academyName: contract.academy_name,
            type: 'expired',
            title: 'Contract Expired',
            message: `Expired on ${contract.end_date}`,
            days: diffDays,
            emailStatus: 'Sent',
            severity: 'critical'
          });
        } else if (contract.status === 'Active') {
          if (diffDays <= 30 && diffDays > 0) {
            parsedAlerts.push({
              id: `30-${contract.id}`,
              contractDbId: contract.id,
              contractId: contract.contract_id,
              academyName: contract.academy_name,
              type: 'expiry-30',
              title: 'Critical Expiry: 30 Days',
              message: `Expires in ${diffDays} days (${contract.end_date})`,
              days: diffDays,
              emailStatus: 'Sent',
              severity: 'critical'
            });
          } else if (diffDays <= 60 && diffDays > 30) {
            parsedAlerts.push({
              id: `60-${contract.id}`,
              contractDbId: contract.id,
              contractId: contract.contract_id,
              academyName: contract.academy_name,
              type: 'expiry-60',
              title: 'Warning Expiry: 60 Days',
              message: `Expires in ${diffDays} days (${contract.end_date})`,
              days: diffDays,
              emailStatus: 'Pending Send',
              severity: 'warning'
            });
          } else if (diffDays <= 90 && diffDays > 60) {
            parsedAlerts.push({
              id: `90-${contract.id}`,
              contractDbId: contract.id,
              contractId: contract.contract_id,
              academyName: contract.academy_name,
              type: 'expiry-90',
              title: 'Notice Expiry: 90 Days',
              message: `Expires in ${diffDays} days (${contract.end_date})`,
              days: diffDays,
              emailStatus: 'Queued',
              severity: 'notice'
            });
          }
        }
      });

      // Sort by severity (critical first)
      parsedAlerts.sort((a, b) => {
        const severityWeight = { critical: 3, warning: 2, notice: 1 };
        return severityWeight[b.severity] - severityWeight[a.severity] || a.days - b.days;
      });

      setAlerts(parsedAlerts);
      setUnreadCount(parsedAlerts.length);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Reload alerts periodically
    const timer = setInterval(fetchAlerts, 60000);

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAlertClick = (contractDbId) => {
    setIsOpen(false);
    navigate(`/contracts/${contractDbId}`);
  };

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-rose-50 border-rose-100',
          text: 'text-rose-800',
          icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-100',
          text: 'text-amber-800',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-100',
          text: 'text-blue-800',
          icon: <Clock className="w-5 h-5 text-blue-600 shrink-0" />
        };
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors border border-slate-100 focus:outline-none"
      >
        <Bell className="w-5 h-5 stroke-[2]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 transform translate-x-1/3 -translate-y-1/3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[9px] font-bold text-white items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden divide-y divide-slate-50 fade-in">
          <div className="p-4 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Alert Center</h4>
              <p className="text-xs text-slate-400">Track expirations and updates</p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={() => setUnreadCount(0)}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2 bg-emerald-50 p-1.5 rounded-full" />
                <p className="text-sm font-medium">All contracts in order</p>
                <p className="text-xs">No pending expiry warnings found.</p>
              </div>
            ) : (
              alerts.map((alert) => {
                const styles = getSeverityStyles(alert.severity);
                return (
                  <div
                    key={alert.id}
                    className={`p-4 flex gap-3 hover:bg-slate-50 cursor-pointer transition-colors ${styles.bg}`}
                    onClick={() => handleAlertClick(alert.contractDbId)}
                  >
                    {styles.icon}
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-bold ${styles.text}`}>
                          {alert.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {alert.contractId}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700">
                        {alert.academyName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {alert.message}
                      </p>
                      <div className="flex justify-between items-center pt-1.5">
                        <span className="text-[10px] bg-white border border-slate-100 rounded px-1.5 py-0.5 text-slate-500 font-medium">
                          Alert: {alert.type.replace('expiry-', '')}d
                        </span>
                        <span className={`text-[10px] flex items-center gap-1 font-semibold ${
                          alert.emailStatus === 'Sent' ? 'text-emerald-600' : 
                          alert.emailStatus === 'Pending Send' ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          <Mail className="w-3 h-3 stroke-[2]" />
                          Email: {alert.emailStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 text-center bg-slate-50/50">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/contracts');
              }}
              className="text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors"
            >
              View All Contracts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertCenter;
