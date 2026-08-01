import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import ChartBar from '../../components/layout/ChartBar.jsx';
import PulseDivider from '../../components/ui/PulseDivider.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Pill, Plus, Trash2, CheckCircle } from 'lucide-react';
import vitalisLogo from '../../assets/vitalis-logo.png';

export default function NewPrescription() {
  const { id } = useParams(); // patientId
  const [searchParams] = useSearchParams();
  const aptId = searchParams.get('aptId');
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([
    { name: 'Amoxicillin 500mg', dosage: '1 Tablet', frequency: 'Twice daily (1-0-1)', duration: '5 Days', instructions: 'After meals' }
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '1 Tablet', frequency: 'Twice daily (1-0-1)', duration: '5 Days', instructions: 'After meals' }]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, idx) => idx !== index));
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (medicines.length === 0 || medicines.some(m => !m.name)) {
      setError('Please provide at least one medicine with a valid name.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/clinical/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: id,
          appointmentId: aptId,
          medicines,
          notes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to issue prescription');
      }

      navigate(`/doctor/patients/${id}/record`);
    } catch (err) {
      setError(err.message || 'Error creating prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell role="doctor">
      <ChartBar
        title="Issue Clinical Prescription Pad"
        subtitle="VITALIS DIGITAL RX · PRESCRIPTION LINE ITEMS & DOSAGE INSTRUCTIONS"
        ward="indigo"
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <form onSubmit={handleSubmit} className="bg-surface border-2 border-line p-8 rounded-sm shadow-sm space-y-6">
          {/* Header Pad */}
          <div className="flex justify-between items-center border-b-2 border-line pb-4">
            <div className="flex items-center gap-3">
              <img src={vitalisLogo} alt="Vitalis Logo" className="h-10 w-auto" />
              <div>
                <h3 className="font-display font-bold text-xl text-ink">{user?.name || 'Dr. Attending'}</h3>
                <p className="font-mono text-[10.5px] text-indigo uppercase font-semibold">Cardiology OPD · Vitalis Hospital</p>
              </div>
            </div>
            <div className="text-right font-mono text-xs text-sub">
              <span>DATE: {new Date().toLocaleDateString()}</span>
              <p className="font-bold text-ink text-sm">Rx PAD</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-tint border border-red/30 rounded font-mono text-xs text-red">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-mono text-xs font-bold uppercase text-sub tracking-wider">
                Prescribed Medications
              </h4>
              <Button type="button" variant="ghost" ward="indigo" icon={Plus} onClick={handleAddMedicine}>
                Add Medicine
              </Button>
            </div>

            {medicines.map((med, idx) => (
              <div key={idx} className="p-4 border border-line rounded bg-bg/40 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block font-mono text-[10px] uppercase font-semibold text-sub mb-1">
                    Medicine & Strength *
                  </label>
                  <input
                    type="text"
                    required
                    value={med.name}
                    onChange={(e) => handleMedChange(idx, 'name', e.target.value)}
                    placeholder="e.g. Metoprolol 50mg"
                    className="w-full px-2.5 py-1.5 border border-line rounded text-xs font-body text-ink focus:border-indigo"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase font-semibold text-sub mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-line rounded text-xs font-body text-ink focus:border-indigo"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase font-semibold text-sub mb-1">
                    Frequency / Duration
                  </label>
                  <input
                    type="text"
                    value={med.frequency}
                    onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-line rounded text-xs font-body text-ink focus:border-indigo"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={med.instructions}
                    onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                    placeholder="Instructions"
                    className="w-full px-2.5 py-1.5 border border-line rounded text-xs font-body text-ink focus:border-indigo"
                  />
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      className="p-1.5 text-red hover:bg-red-tint rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
              Physician Special Instructions / Advice
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Rest for 3 days, avoid heavy exertion, follow up in 1 week..."
              className="w-full p-3 border border-line rounded text-sm font-body text-ink focus:border-indigo"
            />
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-line">
            <Button type="button" variant="ghost" ward="ink" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" ward="indigo" disabled={loading}>
              {loading ? 'ISSUING Rx...' : 'ISSUE PRESCRIPTION →'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
