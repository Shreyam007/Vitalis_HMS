import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import ChartBar from '../../components/layout/ChartBar.jsx';
import StampBadge from '../../components/ui/StampBadge.jsx';
import PulseDivider from '../../components/ui/PulseDivider.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSSE } from '../../hooks/useSSE.js';
import { CheckCircle, Printer, ArrowRight } from 'lucide-react';
import vitalisLogo from '../../assets/vitalis-logo.png';

export default function BookingConfirmation() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointment(data);
      }
    } catch (err) {
      console.error('Fetch appointment detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, token]);

  useSSE((type, payload) => {
    if (payload?._id === id || payload?.appointmentId === appointment?.appointmentId) {
      fetchDetails();
    }
  });

  if (loading) {
    return (
      <AppShell role="patient">
        <div className="p-12 text-center font-mono text-xs text-faint uppercase">
          RETRIEVING VISIT TICKET...
        </div>
      </AppShell>
    );
  }

  if (!appointment) {
    return (
      <AppShell role="patient">
        <div className="p-12 text-center">
          <p className="font-mono text-xs text-red uppercase">TICKET NOT FOUND</p>
          <Button variant="ghost" ward="teal" className="mt-4" onClick={() => navigate('/patient/home')}>
            Return to Dashboard
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="patient">
      <ChartBar
        title="Visit Ticket & Confirmation"
        subtitle={`TICKET ID: ${appointment.appointmentId} · QUEUE NO: #${appointment.queuePosition || 1} · STATUS: ${appointment.status.toUpperCase()}`}
        ward="teal"
      />

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Ticket Container */}
        <div className="bg-surface border-2 border-line rounded-sm overflow-hidden shadow-sm">
          {/* Top Wristband Edge */}
          <div className="h-2 w-full bg-[repeating-linear-gradient(45deg,#0F6E5D,#0F6E5D_10px,#3A4B8C_10px,#3A4B8C_20px,#B1631F_20px,#B1631F_30px)]" />

          <div className="p-8 space-y-6">
            {/* Header / Logo */}
            <div className="flex justify-between items-start border-b border-line pb-6">
              <div className="flex items-center gap-3">
                <img src={vitalisLogo} alt="Vitalis Logo" className="h-10 w-auto" />
                <div>
                  <h3 className="font-display text-xl font-bold text-ink">Vitalis Clinical Ticket</h3>
                  <p className="font-mono text-[10px] text-faint uppercase">Official OPD Admission Slip</p>
                </div>
              </div>
              <StampBadge status={appointment.status} />
            </div>

            {/* Ticket Details Grid */}
            <div className="grid grid-cols-2 gap-6 font-mono text-xs">
              <div>
                <span className="text-faint uppercase block text-[10px]">Patient Name</span>
                <span className="font-bold text-ink text-sm font-body">{appointment.patientId?.userId?.name || 'Patient'}</span>
              </div>

              <div>
                <span className="text-faint uppercase block text-[10px]">Queue Position</span>
                <span className="font-bold text-teal text-lg">#{appointment.queuePosition || 1}</span>
              </div>

              <div>
                <span className="text-faint uppercase block text-[10px]">Attending Doctor</span>
                <span className="font-bold text-ink font-body">{appointment.doctorId?.name || 'Dr. Assigned'}</span>
                <span className="block text-[10px] text-sub">{appointment.specialization}</span>
              </div>

              <div>
                <span className="text-faint uppercase block text-[10px]">Date & Time</span>
                <span className="font-bold text-ink">{appointment.date}</span>
                <span className="block text-[10px] text-sub">{appointment.slotTime}</span>
              </div>
            </div>

            {/* Chief Complaint Box */}
            <div className="bg-bg border border-line p-4 rounded text-xs space-y-1">
              <span className="font-mono text-[10px] font-bold text-sub uppercase tracking-wider block">
                Chief Complaint / Symptoms
              </span>
              <p className="font-body text-ink">{appointment.chiefComplaint}</p>
            </div>

            <PulseDivider label="LIVE STATUS WORKFLOW" />

            {/* Status Workflow Bar */}
            <div className="grid grid-cols-4 gap-2 text-center font-mono text-[10px] uppercase font-semibold">
              <div className="p-2 border rounded border-teal bg-teal-tint text-teal">
                1. Booked
              </div>
              <div className={`p-2 border rounded ${['confirmed', 'completed'].includes(appointment.status) ? 'border-teal bg-teal-tint text-teal' : 'border-line text-faint'}`}>
                2. Confirmed
              </div>
              <div className={`p-2 border rounded ${['confirmed'].includes(appointment.status) ? 'border-indigo bg-indigo-tint text-indigo' : 'border-line text-faint'}`}>
                3. In Queue
              </div>
              <div className={`p-2 border rounded ${['completed'].includes(appointment.status) ? 'border-indigo bg-indigo-tint text-indigo' : 'border-line text-faint'}`}>
                4. Consulted
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex justify-between items-center border-t border-line">
              <Button variant="ghost" ward="ink" icon={Printer} onClick={() => window.print()}>
                Print Ticket
              </Button>
              <Button variant="primary" ward="teal" icon={ArrowRight} onClick={() => navigate('/patient/home')}>
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
