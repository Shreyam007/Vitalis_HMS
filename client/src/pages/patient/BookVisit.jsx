import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import ChartBar from '../../components/layout/ChartBar.jsx';
import PulseDivider from '../../components/ui/PulseDivider.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Stethoscope, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function BookVisit() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [specialization, setSpecialization] = useState('Cardiology');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const specializations = [
    'Cardiology', 'Neurology', 'General Medicine', 'Pediatrics', 'Orthopedics', 'Dermatology'
  ];

  const availableSlots = [
    '09:00 AM', '10:30 AM', '11:45 AM', '02:00 PM', '03:30 PM', '05:00 PM'
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch(`/api/doctors?specialization=${encodeURIComponent(specialization)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
          if (data.length > 0) setSelectedDoctor(data[0]);
          else setSelectedDoctor(null);
        }
      } catch (err) {
        console.error('Fetch doctors error:', err);
      }
    };
    fetchDoctors();
  }, [specialization, token]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) {
      setError('Please select a doctor.');
      return;
    }
    if (!chiefComplaint) {
      setError('Please describe your chief complaint or symptoms.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: selectedDoctor._id,
          date: selectedDate,
          slotTime: selectedSlot,
          specialization,
          chiefComplaint
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Booking failed');
      }

      navigate(`/patient/book/confirm/${data._id}`);
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell role="patient">
      <ChartBar
        title="Book a Clinical Visit"
        subtitle="SELECT SPECIALIZATION → CHOOSE DOCTOR & TIME SLOT → CONFIRM TICKET"
        ward="teal"
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {error && (
          <div className="p-3 bg-red-tint border border-red/30 rounded font-mono text-xs text-red">
            {error}
          </div>
        )}

        {/* 1. Specialization Selector */}
        <div className="bg-surface border border-line p-6 rounded-sm">
          <label className="block font-mono text-xs font-bold uppercase text-sub tracking-wider mb-3">
            1. Select Clinical Specialization
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {specializations.map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => setSpecialization(spec)}
                className={`p-3 border rounded text-left flex items-center gap-3 transition-all ${
                  specialization === spec 
                    ? 'border-teal bg-teal-tint/50 text-teal font-bold' 
                    : 'border-line text-ink hover:border-line-strong'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-teal" />
                <span className="font-mono text-xs uppercase">{spec}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Doctor & Date/Slot Picker */}
        <div className="bg-surface border border-line p-6 rounded-sm space-y-4">
          <label className="block font-mono text-xs font-bold uppercase text-sub tracking-wider">
            2. Choose Doctor & Slot Time
          </label>

          {doctors.length === 0 ? (
            <p className="font-mono text-xs text-faint uppercase py-4">No doctors available for this specialization yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => setSelectedDoctor(doc)}
                  className={`p-4 border rounded cursor-pointer transition-all ${
                    selectedDoctor?._id === doc._id 
                      ? 'border-teal bg-teal-tint/30' 
                      : 'border-line hover:border-line-strong'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-display font-bold text-ink">{doc.name}</h4>
                      <p className="font-mono text-[10px] text-faint uppercase">{doc.qualification} · {doc.department}</p>
                    </div>
                    <span className="font-mono text-xs text-teal font-bold">₹{doc.consultationFee}</span>
                  </div>
                  <p className="font-mono text-[10px] text-sub mt-2">AVAILABLE: {doc.availableDays?.join(', ')}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-line">
            <div>
              <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
                Consultation Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-line rounded text-sm font-body focus:outline-none focus:border-teal"
              />
            </div>
            <div>
              <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
                Available Time Slot
              </label>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-1 border rounded font-mono text-[11px] uppercase transition-all ${
                      selectedSlot === slot 
                        ? 'border-teal bg-teal text-surface font-bold' 
                        : 'border-line text-ink hover:border-line-strong'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Chief Complaint & Confirm */}
        <form onSubmit={handleBooking} className="bg-surface border border-line p-6 rounded-sm space-y-4">
          <label className="block font-mono text-xs font-bold uppercase text-sub tracking-wider">
            3. Chief Complaint / Reason for Visit
          </label>
          <textarea
            rows={3}
            required
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            placeholder="e.g. Chest discomfort after walking, routine checkup, persistent cough..."
            className="w-full p-3 border border-line rounded text-sm font-body text-ink focus:outline-none focus:border-teal"
          />

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              ward="teal"
              disabled={loading || !selectedDoctor}
            >
              {loading ? 'CONFIRMING...' : 'CONFIRM VISIT TICKET'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
