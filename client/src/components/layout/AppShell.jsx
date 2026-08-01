import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Home, Calendar, FileText, CreditCard, Users, UserCheck, 
  Activity, Settings, Bell, HelpCircle, LogOut, Clock 
} from 'lucide-react';
import vitalisLogo from '../../assets/vitalis-logo.png';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AppShell({ children, role = 'patient' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentTime, setCurrentTime] = useState('');

  // Live 24-Hour Indian Standard Time (IST) Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(`${formatted} IST`);
    };

    updateClock();
    const timerId = setInterval(updateClock, 1000);
    return () => clearInterval(timerId);
  }, []);

  const wardColorMap = {
    patient: { name: 'teal', border: 'border-l-teal', dot: 'bg-teal', text: 'text-teal', wardPill: '● Patient Ward', bgTint: 'bg-teal-tint' },
    doctor: { name: 'indigo', border: 'border-l-indigo', dot: 'bg-indigo', text: 'text-indigo', wardPill: '● Doctor Ward', bgTint: 'bg-indigo-tint' },
    admin: { name: 'rust', border: 'border-l-rust', dot: 'bg-rust', text: 'text-rust', wardPill: '● Admin Ward', bgTint: 'bg-rust-tint' }
  };

  const currentRole = user?.role || role;
  const currentWard = wardColorMap[currentRole] || wardColorMap.patient;

  const navItems = {
    patient: [
      { label: 'HOME', icon: Home, path: '/patient/home' },
      { label: 'BOOK', icon: Calendar, path: '/patient/book' },
      { label: 'RECORDS', icon: FileText, path: '/patient/records/my-history' },
      { label: 'BILLING', icon: CreditCard, path: '/patient/billing' },
    ],
    doctor: [
      { label: 'QUEUE', icon: Calendar, path: '/doctor/queue' },
      { label: 'RECORDS', icon: FileText, path: '/doctor/patients/my-history/record' },
    ],
    admin: [
      { label: 'OVERVIEW', icon: Activity, path: '/admin/overview' },
      { label: 'DOCTORS', icon: UserCheck, path: '/admin/doctors' },
      { label: 'PATIENTS', icon: Users, path: '/admin/patients' },
      { label: 'REPORTS', icon: FileText, path: '/admin/reports' },
    ]
  }[currentRole] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-grid-pattern">
      {/* Left Nav Rail */}
      <aside className="w-20 md:w-24 bg-ink text-surface flex flex-col justify-between items-center py-4 z-20 select-none flex-shrink-0">
        <div className="flex flex-col items-center w-full space-y-6">
          {/* Logo Mark */}
          <Link to="/" className="p-2 hover:opacity-80 transition-opacity">
            <img src={vitalisLogo} alt="Vitalis" className="h-8 w-auto" />
          </Link>

          {/* Navigation Items */}
          <nav className="w-full flex flex-col items-center space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`w-full py-3 flex flex-col items-center justify-center relative transition-all duration-200 group ${
                    isActive 
                      ? `bg-surface/10 border-l-[4px] ${currentWard.border} text-surface` 
                      : 'text-faint hover:text-surface hover:bg-surface/5 border-l-[4px] border-transparent'
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5 mb-1 transition-transform group-hover:scale-110" />
                    {isActive && (
                      <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${currentWard.dot} animate-pulse`} />
                    )}
                  </div>
                  <span className="font-mono text-[9.5px] tracking-wider uppercase font-semibold">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Rail Actions */}
        <div className="flex flex-col items-center space-y-4 w-full px-2">
          <button 
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-faint hover:text-red transition-colors rounded"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-surface/20 text-surface flex items-center justify-center font-mono text-xs font-bold uppercase border border-surface/30">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-surface border-b border-line px-6 flex items-center justify-between z-10 flex-shrink-0">
          {/* Left Wordmark & Quick Links */}
          <div className="flex items-center gap-6">
            <span className="font-display font-bold text-lg text-ink tracking-tight flex items-center gap-2">
              Vitalis
              <span className="font-mono text-[10px] text-faint uppercase font-normal">v1.0</span>
            </span>
            <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-sub">
              {currentRole === 'patient' && (
                <>
                  <span className="hover:text-ink cursor-pointer">Quick Access</span>
                  <span>/</span>
                  <span className="hover:text-ink cursor-pointer">Support</span>
                </>
              )}
              {currentRole === 'doctor' && (
                <>
                  <span className="hover:text-ink cursor-pointer">OPD-1</span>
                  <span>/</span>
                  <span className="hover:text-ink cursor-pointer">Ward-B</span>
                  <span>/</span>
                  <span className="hover:text-ink cursor-pointer">ICU-4</span>
                </>
              )}
              {currentRole === 'admin' && (
                <>
                  <span className="hover:text-ink cursor-pointer">System Logs</span>
                  <span>/</span>
                  <span className="hover:text-ink cursor-pointer">Staff Directory</span>
                </>
              )}
            </div>
          </div>

          {/* Right Icons, Live 24H Clock & Ward Pill */}
          <div className="flex items-center gap-4">
            {/* Live 24-Hour Real-Time Clock Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-bg border border-line rounded font-mono text-[11px] font-bold text-ink tracking-wider shadow-inner">
              <Clock className="w-3.5 h-3.5 text-teal animate-pulse" />
              <span>{currentTime}</span>
            </div>

            <span className={`hidden sm:inline-block px-3 py-1 border rounded-full font-mono text-[10.5px] font-semibold tracking-wider ${currentWard.bgTint} ${currentWard.text}`}>
              {currentWard.wardPill}
            </span>
            <button className="text-sub hover:text-ink p-1">
              <Bell className="w-4 h-4" />
            </button>
            <button className="text-sub hover:text-ink p-1">
              <HelpCircle className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 border-l border-line pl-4">
              <div className="w-7 h-7 rounded-full bg-ink text-surface flex items-center justify-center font-mono text-xs font-bold uppercase">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="font-body text-xs font-semibold text-ink leading-tight">{user?.name || 'User'}</span>
                <span className="font-mono text-[9.5px] text-faint uppercase leading-tight">{user?.role || 'Guest'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content with Responsive Grid Canvas & Smooth Page Transitions */}
        <main className="flex-1 overflow-y-auto bg-grid-pattern animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
