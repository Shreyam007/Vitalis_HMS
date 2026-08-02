import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import vitalisLogo from '../../assets/vitalis-logo.png';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Stethoscope, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickFill = (role) => {
    setSelectedRole(role);
    if (role === 'patient') {
      setEmail('patient@vitalis.hms');
      setPassword('patient123');
    } else if (role === 'doctor') {
      setEmail('doctor@vitalis.hms');
      setPassword('doctor123');
    } else if (role === 'admin') {
      setEmail('admin@vitalis.hms');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'doctor') navigate('/doctor/queue');
      else if (loggedUser.role === 'admin') navigate('/admin/overview');
      else navigate('/patient/home');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const roleTileStyles = {
    patient: 'border-teal bg-teal-tint/50 text-teal',
    doctor: 'border-indigo bg-indigo-tint/50 text-indigo',
    admin: 'border-rust bg-rust-tint/50 text-rust'
  };

  return (
    <div className="min-h-screen bg-grid-pattern flex flex-col items-center justify-center p-4">
      {/* Wristband Card Container */}
      <div className="w-full max-w-md bg-surface border border-line shadow-sm rounded-sm overflow-hidden">
        {/* Striped Top Edge (Wristband visual) */}
        <div className="h-3 w-full bg-[repeating-linear-gradient(45deg,#0F6E5D,#0F6E5D_10px,#3A4B8C_10px,#3A4B8C_20px,#B1631F_20px,#B1631F_30px)]" />

        <div className="p-8">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <img src={vitalisLogo} alt="Vitalis Logo" className="h-14 mx-auto mb-3" />
            <h1 className="font-display text-2xl font-bold text-ink">Vitalis HMS</h1>
            <p className="font-mono text-xs text-sub uppercase tracking-wider mt-1">Hospital Management System</p>
          </div>

          {/* Role Select Tiles */}
          <div className="mb-6">
            <label className="block font-mono text-[10.5px] uppercase tracking-wider font-semibold text-sub mb-2">
              Select Ward Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('patient')}
                className={`p-3 border rounded flex flex-col items-center gap-1 transition-all ${
                  selectedRole === 'patient' ? roleTileStyles.patient : 'border-line text-sub hover:border-line-strong'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="font-mono text-[10px] uppercase font-bold">Patient</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('doctor')}
                className={`p-3 border rounded flex flex-col items-center gap-1 transition-all ${
                  selectedRole === 'doctor' ? roleTileStyles.doctor : 'border-line text-sub hover:border-line-strong'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span className="font-mono text-[10px] uppercase font-bold">Doctor</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className={`p-3 border rounded flex flex-col items-center gap-1 transition-all ${
                  selectedRole === 'admin' ? roleTileStyles.admin : 'border-line text-sub hover:border-line-strong'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="font-mono text-[10px] uppercase font-bold">Admin</span>
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-tint border border-red/30 rounded font-mono text-xs text-red">
                {error}
              </div>
            )}

            <div>
              <label className="block font-mono text-[10.5px] uppercase tracking-wider font-semibold text-sub mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@vitalis.hms"
                className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:outline-none focus:border-ink"
              />
            </div>

            <div>
              <label className="block font-mono text-[10.5px] uppercase tracking-wider font-semibold text-sub mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:outline-none focus:border-ink"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              ward={selectedRole === 'patient' ? 'teal' : selectedRole === 'doctor' ? 'indigo' : 'rust'}
              disabled={loading}
              className="w-full mt-2"
            >
              {loading ? 'AUTHENTICATING...' : `LOG IN TO ${selectedRole.toUpperCase()} WARD`}
            </Button>
          </form>

          {/* Patient Self-Registration Link */}
          <div className="mt-6 pt-4 border-t border-line text-center">
            <p className="font-body text-xs text-sub">
              New patient?{' '}
              <Link to="/register" className="font-mono font-semibold text-teal hover:underline uppercase">
                Register Wristband →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
