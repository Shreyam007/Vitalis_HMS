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
import { UserCheck, Users, FileText, Download, Plus } from 'lucide-react';

export default function AdminOverview() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (err) {
      console.error('Fetch admin overview error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useSSE((type) => {
    if (['appointment:created', 'appointment:statusChanged', 'queue:update'].includes(type)) {
      fetchOverview();
    }
  });

  const handleConfirmApt = async (id) => {
    try {
      await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'confirmed' })
      });
      fetchOverview();
    } catch (err) {
      console.error('Confirm error:', err);
    }
  };

  const columns = [
    {
      header: 'APT ID',
      accessor: 'appointmentId'
    },
    {
      header: 'PATIENT',
      cell: (row) => (
        <span className="font-bold text-ink">{row.patientId?.userId?.name || 'Patient'}</span>
      )
    },
    {
      header: 'ASSIGNED DOCTOR',
      cell: (row) => (
        <span className="font-mono text-xs text-sub">{row.doctorId?.name || 'Doctor'}</span>
      )
    },
    {
      header: 'DATE & TIME',
      cell: (row) => (
        <span className="font-mono text-xs text-sub">{row.date} · {row.slotTime}</span>
      )
    },
    {
      header: 'STATUS',
      cell: (row) => <StampBadge status={row.status} />
    },
    {
      header: 'ACTION',
      cell: (row) => (
        <button
          onClick={() => handleConfirmApt(row._id)}
          className="px-2.5 py-1 bg-rust text-surface font-mono text-[10px] uppercase font-bold rounded border border-rust hover:bg-rust-deep transition-all"
        >
          CONFIRM TICKET →
        </button>
      )
    }
  ];

  return (
    <AppShell role="admin">
      <ChartBar
        title="Admin Overview & Hospital Analytics"
        subtitle="VITALIS HOSPITAL MANAGEMENT · EXECUTIVE AGGREGATE DASHBOARD"
        ward="rust"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="primary" ward="rust" icon={Plus} onClick={() => navigate('/admin/doctors/new')}>
              Add Doctor
            </Button>
            <Button variant="ghost" ward="rust" icon={Download} onClick={() => navigate('/admin/reports')}>
              Reports & CSV
            </Button>
          </div>
        }
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Stat Cards */}
        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-faint uppercase">
            COMPUTING HOSPITAL ANALYTICS...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Total Patients" value={overview?.stats?.totalPatients || 0} subtext="Registered wristbands" ward="teal" />
              <StatCard label="Active Physicians" value={overview?.stats?.totalDoctors || 0} subtext="On-call clinical staff" ward="indigo" />
              <StatCard label="Total Appointments" value={overview?.stats?.totalAppointments || 0} subtext="Visits logged" ward="amber" />
              <StatCard label="Gross Revenue" value={`₹${overview?.stats?.totalRevenue || 0}`} subtext="OPD consultation total" ward="rust" />
            </div>

            <PulseDivider label="PENDING APPOINTMENT CONFIRMATIONS (LIVE SSE)" />

            <DataTable
              columns={columns}
              data={overview?.recentPending || []}
              emptyMessage="NO PENDING CONFIRMATIONS AT THIS TIME."
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
