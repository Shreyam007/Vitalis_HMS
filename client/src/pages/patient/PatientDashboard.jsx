import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import ChartBar from '../../components/layout/ChartBar.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import StampBadge from '../../components/ui/StampBadge.jsx';
import PulseDivider from '../../components/ui/PulseDivider.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSSE } from '../../hooks/useSSE.js';
import { Calendar, CreditCard, Pill, Plus } from 'lucide-react';

export default function PatientDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch('/api/appointments/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error('Fetch appointments error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Live SSE listener
  useSSE((type, payload) => {
    if (['appointment:created', 'appointment:statusChanged', 'queue:update'].includes(type)) {
      fetchAppointments();
    }
  });

  const nextAppointment = appointments.find(a => a.status === 'confirmed' || a.status === 'pending');

  const columns = [
    {
      header: 'APPOINTMENT ID',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-ink">{row.appointmentId}</span>
      )
    },
    {
      header: 'DOCTOR / DEPT',
      cell: (row) => (
        <div>
          <p className="font-body text-xs font-semibold text-ink">{row.doctorId?.name || 'Dr. Assigned'}</p>
          <p className="font-mono text-[10px] text-faint uppercase">{row.specialization}</p>
        </div>
      )
    },
    {
      header: 'DATE & TIME',
      cell: (row) => (
        <span className="font-mono text-xs text-sub">{row.date} · {row.slotTime}</span>
      )
    },
    {
      header: 'COMPLAINT',
      accessor: 'chiefComplaint'
    },
    {
      header: 'STATUS',
      cell: (row) => <StampBadge status={row.status} />
    },
    {
      header: 'ACTION',
      cell: (row) => (
        <button 
          onClick={() => navigate(`/patient/book/confirm/${row._id}`)}
          className="font-mono text-[11px] text-teal font-semibold hover:underline"
        >
          VIEW STAMP →
        </button>
      )
    }
  ];

  return (
    <AppShell role="patient">
      <ChartBar 
        title={`Good day, ${user?.name || 'Patient'}`}
        subtitle={`PATIENT ID: ${user?.profile?.patientId || 'PAT-DEMO'} · BLOOD GRP: ${user?.profile?.bloodGroup || 'O+'} · VITALIS CLINICAL SYSTEM`}
        ward="teal"
        actions={
          <Button variant="primary" ward="teal" icon={Plus} onClick={() => navigate('/patient/book')}>
            Book Visit
          </Button>
        }
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Next Appointment"
            value={nextAppointment ? `${nextAppointment.date} · ${nextAppointment.slotTime}` : 'No Visit Scheduled'}
            subtext={nextAppointment ? `${nextAppointment.doctorId?.name} (${nextAppointment.specialization})` : 'Book your next consultation'}
            ward="teal"
            actionLink={{
              label: nextAppointment ? 'View Ticket' : 'Book Visit',
              href: nextAppointment ? `/patient/book/confirm/${nextAppointment._id}` : '/patient/book'
            }}
          />

          <StatCard
            label="Outstanding Balance"
            value="₹0.00"
            subtext="No unpaid invoices"
            ward="rust"
            actionLink={{ label: 'View Billing', href: '/patient/billing' }}
          />

          <StatCard
            label="Active Prescriptions"
            value="1 Active"
            subtext="Refill available on history"
            ward="indigo"
            actionLink={{ label: 'View Records', href: '/patient/records/my-history' }}
          />
        </div>

        <PulseDivider label="LIVE APPOINTMENT QUEUE & CLINICAL VISITS" />

        {/* Data Table */}
        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-faint uppercase">
            LOADING PATIENT RECORDS...
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={appointments} 
            emptyMessage="NO APPOINTMENT RECORDS FOUND. CLICK 'BOOK VISIT' TO SCHEDULE A CONSULTATION."
          />
        )}
      </div>
    </AppShell>
  );
}
