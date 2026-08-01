import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import ChartBar from '../../components/layout/ChartBar.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function DoctorForm() {
  const { id } = useParams(); // null if new
  const isEdit = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: 'Cardiology',
    qualification: 'MD, FACC',
    experienceYears: 8,
    department: 'Cardiology Ward',
    consultationFee: 150,
    roomNo: 'Room 302'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchDoctor = async () => {
        try {
          const res = await fetch(`/api/doctors/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setFormData({
              name: data.name,
              email: data.userId?.email || '',
              password: '',
              specialization: data.specialization,
              qualification: data.qualification,
              experienceYears: data.experienceYears,
              department: data.department,
              consultationFee: data.consultationFee,
              roomNo: data.roomNo || ''
            });
          }
        } catch (err) {
          console.error('Fetch doctor detail error:', err);
        }
      };
      fetchDoctor();
    }
  }, [id, isEdit, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = isEdit ? `/api/admin/doctors/${id}` : '/api/admin/doctors';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Operation failed');
      }

      navigate('/admin/doctors');
    } catch (err) {
      setError(err.message || 'Failed to save doctor profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell role="admin">
      <ChartBar
        title={isEdit ? `Edit Profile — ${formData.name}` : 'Provision New Doctor Profile'}
        subtitle="ADMINISTRATION WARD · CLINICAL CREDENTIALS & DEPARTMENT ASSIGNMENT"
        ward="rust"
      />

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <form onSubmit={handleSubmit} className="bg-surface border border-line p-6 rounded-sm space-y-4">
          {error && (
            <div className="p-3 bg-red-tint border border-red/30 rounded font-mono text-xs text-red">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Dr. Alexander Wright"
                className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:border-rust"
              />
            </div>

            <div>
              <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                disabled={isEdit}
                value={formData.email}
                onChange={handleChange}
                placeholder="doctor@vitalis.hms"
                className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:border-rust disabled:bg-bg"
              />
            </div>
          </div>

          {!isEdit && (
            <div>
              <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
                Initial Account Password *
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:border-rust"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
                Specialization *
              </label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:border-rust"
              >
                {['Cardiology', 'Neurology', 'General Medicine', 'Pediatrics', 'Orthopedics', 'Dermatology'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
                Department *
              </label>
              <input
                type="text"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Cardiology Ward, OPD-1"
                className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:border-rust"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
                Qualification
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="MD, FACC"
                className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:border-rust"
              />
            </div>

            <div>
              <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:border-rust"
              />
            </div>

            <div>
              <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
                Consultation Fee (₹)
              </label>
              <input
                type="number"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:border-rust"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <Button type="button" variant="ghost" ward="ink" onClick={() => navigate('/admin/doctors')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" ward="rust" disabled={loading}>
              {loading ? 'SAVING...' : isEdit ? 'UPDATE DOCTOR PROFILE' : 'PROVISION DOCTOR'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
