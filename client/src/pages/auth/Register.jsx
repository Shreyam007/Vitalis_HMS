import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import vitalisLogo from '../../assets/vitalis-logo.png';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Check } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
    bloodGroup: 'O+',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: 'Spouse',
    allergies: '',
    preExistingConditions: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerPatient } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required account fields.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.phone || !formData.dateOfBirth) {
        setError('Please provide phone number and date of birth.');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone,
        bloodGroup: formData.bloodGroup,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relation: formData.emergencyRelation
        },
        allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : [],
        preExistingConditions: formData.preExistingConditions ? formData.preExistingConditions.split(',').map(s => s.trim()) : []
      };

      await registerPatient(payload);
      navigate('/patient/home');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface border border-line shadow-sm rounded-sm overflow-hidden">
        {/* Teal Header Bar */}
        <div className="bg-teal text-surface p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={vitalisLogo} alt="Vitalis Logo" className="h-10 w-auto filter brightness-0 invert" />
            <div>
              <h2 className="font-display font-bold text-lg leading-tight">Patient Registration</h2>
              <p className="font-mono text-[10px] uppercase tracking-wider text-teal-tint">Vitalis Patient Ward</p>
            </div>
          </div>
          <span className="font-mono text-xs border border-teal-tint/40 px-2 py-0.5 rounded text-teal-tint">
            STEP {step} OF 3
          </span>
        </div>

        {/* 3-Step Tracker Bar */}
        <div className="bg-bg border-b border-line p-3 flex items-center justify-around font-mono text-[10.5px] uppercase font-semibold text-sub">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-teal font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step > 1 ? 'bg-teal text-surface' : step === 1 ? 'border-2 border-teal text-teal' : 'border border-line text-faint'}`}>
              {step > 1 ? <Check className="w-3 h-3" /> : '1'}
            </span>
            Account
          </div>
          <span className="text-line-strong">→</span>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-teal font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step > 2 ? 'bg-teal text-surface' : step === 2 ? 'border-2 border-teal text-teal' : 'border border-line text-faint'}`}>
              {step > 2 ? <Check className="w-3 h-3" /> : '2'}
            </span>
            Personal
          </div>
          <span className="text-line-strong">→</span>
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-teal font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'border-2 border-teal text-teal' : 'border border-line text-faint'}`}>
              3
            </span>
            Medical
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-tint border border-red/30 rounded font-mono text-xs text-red">
              {error}
            </div>
          )}

          {/* STEP 1: Account Information */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <label className="block font-mono text-[10.5px] uppercase tracking-wider font-semibold text-sub mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block font-mono text-[10.5px] uppercase tracking-wider font-semibold text-sub mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:outline-none focus:border-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10.5px] uppercase tracking-wider font-semibold text-sub mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:outline-none focus:border-teal"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10.5px] uppercase tracking-wider font-semibold text-sub mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:outline-none focus:border-teal"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <Link to="/login" className="font-mono text-xs text-sub hover:text-ink">
                  ← Back to Login
                </Link>
                <Button type="submit" variant="primary" ward="teal">
                  Next Step
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: Personal Details */}
          {step === 2 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10.5px] uppercase tracking-wider font-semibold text-sub mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:outline-none focus:border-teal"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10.5px] uppercase tracking-wider font-semibold text-sub mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:outline-none focus:border-teal"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10.5px] uppercase tracking-wider font-semibold text-sub mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 019-2834"
                    className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:outline-none focus:border-teal"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10.5px] uppercase tracking-wider font-semibold text-sub mb-1">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:outline-none focus:border-teal"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <Button type="button" variant="ghost" ward="teal" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button type="submit" variant="primary" ward="teal">
                  Next Step
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: Medical History & Emergency Contact */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-bg border border-line p-3 rounded space-y-3">
                <p className="font-mono text-[10.5px] font-bold text-teal uppercase tracking-wider">
                  Emergency Contact
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleChange}
                    placeholder="Contact Name"
                    className="px-2.5 py-1.5 border border-line rounded text-xs font-body text-ink focus:border-teal"
                  />
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    placeholder="Contact Phone"
                    className="px-2.5 py-1.5 border border-line rounded text-xs font-body text-ink focus:border-teal"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10.5px] uppercase tracking-wider font-semibold text-sub mb-1">
                  Known Allergies (comma separated)
                </label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="e.g. Penicillin, Peanuts"
                  className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block font-mono text-[10.5px] uppercase tracking-wider font-semibold text-sub mb-1">
                  Pre-existing Conditions (comma separated)
                </label>
                <input
                  type="text"
                  name="preExistingConditions"
                  value={formData.preExistingConditions}
                  onChange={handleChange}
                  placeholder="e.g. Hypertension, Asthma"
                  className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:outline-none focus:border-teal"
                />
              </div>

              <div className="pt-4 flex justify-between items-center">
                <Button type="button" variant="ghost" ward="teal" onClick={() => setStep(2)}>
                  ← Back
                </Button>
                <Button type="submit" variant="primary" ward="teal" disabled={loading}>
                  {loading ? 'REGISTERING...' : 'COMPLETE REGISTRATION'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
