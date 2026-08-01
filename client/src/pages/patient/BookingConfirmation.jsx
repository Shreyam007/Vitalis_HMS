import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import ChartBar from '../../components/layout/ChartBar.jsx';
import StampBadge from '../../components/ui/StampBadge.jsx';
import PulseDivider from '../../components/ui/PulseDivider.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSSE } from '../../hooks/useSSE.js';
import { Printer, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';
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

  const handlePrint = () => {
    window.print();
  };

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
      <div className="no-print">
        <ChartBar
          title="Visit Ticket & Confirmation"
          subtitle={`TICKET ID: ${appointment.appointmentId} · QUEUE NO: #${appointment.queuePosition || 1} · STATUS: ${appointment.status.toUpperCase()}`}
          ward="teal"
        />
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6 print-ticket-wrapper">
        {/* Ticket Card Element (Isolated for Print) */}
        <div className="bg-surface border-2 border-line rounded-sm overflow-hidden shadow-sm print-ticket-card">
          {/* Top Wristband Edge */}
          <div className="h-2.5 w-full bg-[repeating-linear-gradient(45deg,#0F6E5D,#0F6E5D_10px,#3A4B8C_10px,#3A4B8C_20px,#B1631F_20px,#B1631F_30px)]" />

          <div className="p-8 space-y-6">
            {/* Header / Logo */}
            <div className="flex justify-between items-start border-b-2 border-line pb-6">
              <div className="flex items-center gap-3">
                <img src={vitalisLogo} alt="Vitalis Logo" className="h-11 w-auto" />
                <div>
                  <h3 className="font-display text-2xl font-bold text-ink tracking-tight">Vitalis Clinical Ticket</h3>
                  <p className="font-mono text-[10.5px] text-teal font-semibold uppercase tracking-wider">
                    OFFICIAL OPD ADMISSION TICKET · WRISTBAND VERIFIED
                  </p>
                </div>
              </div>
              <StampBadge status={appointment.status} />
            </div>

            {/* Ticket Details Grid */}
            <div className="grid grid-cols-2 gap-6 font-mono text-xs">
              <div>
                <span className="text-faint uppercase block text-[10px] tracking-wider font-semibold">Patient Name</span>
                <span className="font-bold text-ink text-base font-body">{appointment.patientId?.userId?.name || 'Patient'}</span>
                <span className="block text-[10px] text-sub">PATIENT ID: {appointment.patientId?.patientId || 'PAT-08841'}</span>
              </div>

              <div className="bg-teal-tint/50 border border-teal/20 p-3 rounded text-center">
                <span className="text-teal uppercase block text-[10px] font-bold tracking-wider">OPD Queue Position</span>
                <span className="font-bold text-teal text-2xl font-mono">#{appointment.queuePosition || 1}</span>
              </div>

              <div>
                <span className="text-faint uppercase block text-[10px] tracking-wider font-semibold">Attending Physician</span>
                <span className="font-bold text-ink font-body text-sm">{appointment.doctorId?.name || 'Dr. Assigned'}</span>
                <span className="block text-[10px] text-indigo font-semibold">{appointment.specialization} Ward</span>
              </div>

              <div>
                <span className="text-faint uppercase block text-[10px] tracking-wider font-semibold">Schedule & Slot</span>
                <span className="font-bold text-ink">{appointment.date}</span>
                <span className="block text-[10px] text-sub">{appointment.slotTime}</span>
              </div>
            </div>

            {/* Chief Complaint Box */}
            <div className="bg-bg border border-line p-4 rounded text-xs space-y-1">
              <span className="font-mono text-[10px] font-bold text-sub uppercase tracking-wider block">
                Chief Complaint / Presenting Symptoms
              </span>
              <p className="font-body text-ink font-medium">{appointment.chiefComplaint}</p>
            </div>

            <PulseDivider label="CLINICAL OPD WORKFLOW STAGE" />

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

            {/* Barcode & Verification Footer */}
            <div className="border-t-2 border-line pt-4 flex justify-between items-center text-sub font-mono text-[10px]">
              <div>
                <p className="font-bold text-ink uppercase tracking-wider">TICKET BARCODE: {appointment.appointmentId}</p>
                <p className="text-faint">Present slip at Counter 3 upon arrival. Valid for today only.</p>
              </div>
              <div className="font-mono text-[11px] font-bold tracking-widest text-ink select-none border border-line px-2 py-1 bg-bg">
                |||| ||| ||||||| ||| |||
              </div>
            </div>

            {/* Screen Actions (Hidden on Print) */}
            <div className="pt-4 flex justify-between items-center border-t border-line no-print">
              <Button variant="ghost" ward="ink" icon={Printer} onClick={handlePrint}>
                Print Ticket
              </Button>
              <Button variant="primary" ward="teal" icon={ArrowRight} onClick={() => navigate('/patient/home')}>
                Dashboard →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
