import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import ChartBar from '../../components/layout/ChartBar.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import PulseDivider from '../../components/ui/PulseDivider.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { FileText, Plus, Upload, Pill } from 'lucide-react';

export default function PatientChartRecord() {
  const { id } = useParams(); // patientId
  const [searchParams] = useSearchParams();
  const aptId = searchParams.get('aptId');
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Record Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [bp, setBp] = useState('120/80');
  const [hr, setHr] = useState('72');
  const [temp, setTemp] = useState('98.6');
  const [weight, setWeight] = useState('70');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPatientHistory = async () => {
    try {
      const res = await fetch(`/api/clinical/patient-history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Fetch patient chart error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientHistory();
  }, [id, token]);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/clinical/medical-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: history.patient._id,
          appointmentId: aptId,
          diagnosis,
          symptoms: symptoms.split(',').map(s => s.trim()),
          vitals: {
            bloodPressure: bp,
            heartRate: Number(hr),
            temperature: Number(temp),
            weightKg: Number(weight)
          },
          clinicalNotes: notes
        })
      });

      if (res.ok) {
        setMessage('Medical record & diagnosis logged successfully!');
        setDiagnosis('');
        setSymptoms('');
        setNotes('');
        fetchPatientHistory();
      }
    } catch (err) {
      setMessage('Error saving record: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell role={user?.role === 'doctor' ? 'doctor' : 'patient'}>
        <div className="p-12 text-center font-mono text-xs text-faint uppercase">
          LOADING CLINICAL CHART...
        </div>
      </AppShell>
    );
  }

  const isDoctor = user?.role === 'doctor';

  return (
    <AppShell role={isDoctor ? 'doctor' : 'patient'}>
      <ChartBar
        title={`Clinical Chart — ${history?.patient?.userId?.name || 'Patient'}`}
        subtitle={`PATIENT ID: ${history?.patient?.patientId} · BLOOD GRP: ${history?.patient?.bloodGroup || 'N/A'} · WRISTBAND: ${history?.patient?.wristbandCode || 'N/A'}`}
        ward={isDoctor ? 'indigo' : 'teal'}
        actions={
          isDoctor && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" ward="indigo" icon={Pill} onClick={() => navigate(`/doctor/patients/${history.patient._id}/prescribe?aptId=${aptId || ''}`)}>
                Prescribe
              </Button>
              <Button variant="ghost" ward="indigo" icon={Upload} onClick={() => navigate(`/doctor/patients/${history.patient._id}/attach-report`)}>
                Attach Report
              </Button>
            </div>
          )
        }
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Vitals Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Blood Pressure" value={bp} subtext="mmHg" ward="teal" />
          <StatCard label="Heart Rate" value={`${hr} bpm`} subtext="Resting pulse" ward="indigo" />
          <StatCard label="Temperature" value={`${temp} °F`} subtext="Oral temp" ward="amber" />
          <StatCard label="Body Weight" value={`${weight} kg`} subtext="Body Mass Index norm" ward="rust" />
        </div>

        {/* Doctor Entry Form if Doctor */}
        {isDoctor && (
          <form onSubmit={handleCreateRecord} className="bg-surface border border-line p-6 rounded-sm space-y-4">
            <h3 className="font-mono text-xs font-bold uppercase text-indigo tracking-wider">
              Add Clinical Consultation Note & Diagnosis
            </h3>

            {message && (
              <div className="p-3 bg-teal-tint border border-teal/30 rounded font-mono text-xs text-teal">
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
                  Primary Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Essential Hypertension, Mild Angina"
                  className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:border-indigo"
                />
              </div>

              <div>
                <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
                  Symptoms (comma separated)
                </label>
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Chest pressure, Fatigue, Shortness of breath"
                  className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:border-indigo"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
                Clinical Examination Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detailed clinical findings, recommended diagnostic tests, follow-up plan..."
                className="w-full p-3 border border-line rounded text-sm font-body text-ink focus:border-indigo"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" ward="indigo" disabled={saving}>
                {saving ? 'SAVING RECORD...' : 'LOG CLINICAL DIAGNOSIS'}
              </Button>
            </div>
          </form>
        )}

        <PulseDivider label="PATIENT MEDICAL HISTORY & DIAGNOSIS LOGS" />

        {/* Existing Records Timeline */}
        <div className="space-y-4">
          {history?.records?.length === 0 ? (
            <div className="p-8 text-center bg-surface border border-line rounded font-mono text-xs text-faint uppercase">
              NO PREVIOUS DIAGNOSIS LOGS FOUND FOR THIS PATIENT.
            </div>
          ) : (
            history.records.map((rec) => (
              <div key={rec._id} className="bg-surface border border-line p-6 rounded-sm space-y-3">
                <div className="flex justify-between items-start border-b border-line pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-indigo">{rec.recordId}</span>
                    <h4 className="font-display text-lg font-bold text-ink mt-0.5">{rec.diagnosis}</h4>
                  </div>
                  <span className="font-mono text-xs text-sub">
                    {new Date(rec.createdAt).toLocaleDateString()} · {rec.doctorId?.name || 'Dr. Attending'}
                  </span>
                </div>

                {rec.symptoms?.length > 0 && (
                  <div className="flex items-center gap-2 font-mono text-xs text-sub">
                    <span className="font-semibold text-faint uppercase">Symptoms:</span>
                    {rec.symptoms.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-bg border border-line rounded text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {rec.clinicalNotes && (
                  <p className="font-body text-sm text-ink bg-bg/50 p-3 rounded border border-line/60">
                    {rec.clinicalNotes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
