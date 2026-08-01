import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import ChartBar from '../../components/layout/ChartBar.jsx';
import StampBadge from '../../components/ui/StampBadge.jsx';
import PulseDivider from '../../components/ui/PulseDivider.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Pill, Printer, ArrowLeft } from 'lucide-react';
import vitalisLogo from '../../assets/vitalis-logo.png';

export default function PrescriptionView() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/clinical/patient-history/my-history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error('Fetch prescription error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token]);

  if (loading) {
    return (
      <AppShell role="patient">
        <div className="p-12 text-center font-mono text-xs text-faint uppercase">
          RETRIEVING PRESCRIPTIONS...
        </div>
      </AppShell>
    );
  }

  const prescriptions = history?.prescriptions || [];

  return (
    <AppShell role="patient">
      <ChartBar
        title="My Clinical Prescriptions"
        subtitle="ACTIVE MEDICATIONS · PHARMACY DISPENSING RECORDS & DOSAGE INSTRUCTIONS"
        ward="teal"
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {prescriptions.length === 0 ? (
          <div className="p-12 text-center bg-surface border border-line rounded font-mono text-xs text-faint uppercase">
            NO PRESCRIPTIONS ISSUED YET.
          </div>
        ) : (
          prescriptions.map((rx) => (
            <div key={rx._id} className="bg-surface border-2 border-line p-8 rounded-sm shadow-sm space-y-6">
              <div className="flex justify-between items-start border-b-2 border-line pb-4">
                <div className="flex items-center gap-3">
                  <img src={vitalisLogo} alt="Vitalis Logo" className="h-10 w-auto" />
                  <div>
                    <h3 className="font-display font-bold text-xl text-ink">{rx.doctorId?.name || 'Dr. Attending'}</h3>
                    <p className="font-mono text-[10.5px] text-faint uppercase">VITALIS HOSPITAL CLINICAL Rx</p>
                  </div>
                </div>
                <div className="text-right">
                  <StampBadge status={rx.status === 'active' ? 'confirmed' : 'completed'} text={rx.status} />
                  <p className="font-mono text-xs font-bold text-ink mt-1">{rx.prescriptionId}</p>
                </div>
              </div>

              {/* Medicines Table */}
              <div className="space-y-3">
                <h4 className="font-mono text-xs font-bold uppercase text-sub tracking-wider">
                  Prescribed Medication List
                </h4>
                <div className="border border-line rounded overflow-hidden">
                  <table className="w-full text-left font-body text-xs">
                    <thead className="bg-bg font-mono text-[10px] uppercase text-sub border-b border-line">
                      <tr>
                        <th className="p-3">Medicine Name</th>
                        <th className="p-3">Dosage</th>
                        <th className="p-3">Frequency</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {rx.medicines?.map((m, idx) => (
                        <tr key={idx} className="hover:bg-bg/40">
                          <td className="p-3 font-bold text-ink">{m.name}</td>
                          <td className="p-3 font-mono">{m.dosage}</td>
                          <td className="p-3 font-mono text-teal font-semibold">{m.frequency}</td>
                          <td className="p-3 font-mono">{m.duration}</td>
                          <td className="p-3 text-sub">{m.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {rx.notes && (
                <div className="bg-bg border border-line p-4 rounded text-xs space-y-1">
                  <span className="font-mono text-[10px] font-bold text-sub uppercase tracking-wider block">
                    Doctor Advice / Notes
                  </span>
                  <p className="font-body text-ink">{rx.notes}</p>
                </div>
              )}

              <div className="pt-2 flex justify-between items-center border-t border-line">
                <span className="font-mono text-[10.5px] text-faint uppercase">
                  ISSUED ON: {new Date(rx.createdAt).toLocaleDateString()}
                </span>
                <Button variant="ghost" ward="teal" icon={Printer} onClick={() => window.print()}>
                  Print Rx
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
