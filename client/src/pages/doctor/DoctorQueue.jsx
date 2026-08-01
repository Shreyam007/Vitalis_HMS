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
import { Stethoscope, FileText, Upload, CheckCircle } from 'lucide-react';

export default function DoctorQueue() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/clinical/doctor/queue', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDoctorInfo(data.doctor);
        setQueue(data.queue || []);
      }
    } catch (err) {
      console.error('Fetch doctor queue error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  useSSE((type) => {
    if (['appointment:created', 'appointment:statusChanged', 'queue:update'].includes(type)) {
      fetchQueue();
    }
  });

  const inQueueCount = queue.filter(q => q.status === 'pending' || q.status === 'confirmed').length;
  const completedCount = queue.filter(q => q.status === 'completed').length;

  const handleUpdateStatus = async (aptId, newStatus) => {
    try {
      await fetch(`/api/appointments/${aptId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchQueue();
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const columns = [
    {
      header: 'QUEUE #',
      cell: (row) => (
        <span className="font-mono text-sm font-bold text-indigo">#{row.queuePosition || 1}</span>
      )
    },
    {
      header: 'PATIENT NAME / ID',
      cell: (row) => (
        <div>
          <p className="font-body text-xs font-bold text-ink">{row.patientId?.userId?.name || 'Patient'}</p>
          <p className="font-mono text-[10px] text-faint uppercase">{row.patientId?.patientId || 'PAT-XXXX'}</p>
        </div>
      )
    },
    {
      header: 'TIME / DATE',
      cell: (row) => (
        <span className="font-mono text-xs text-sub">{row.date} · {row.slotTime}</span>
      )
    },
    {
      header: 'CHIEF COMPLAINT',
      accessor: 'chiefComplaint'
    },
    {
      header: 'STATUS',
      cell: (row) => <StampBadge status={row.status} />
    },
    {
      header: 'ACTIONS',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.status !== 'completed' && (
            <button
              onClick={() => handleUpdateStatus(row._id, 'confirmed')}
              className="px-2 py-1 bg-teal-tint text-teal font-mono text-[10px] font-bold rounded border border-teal/30 hover:bg-teal hover:text-surface transition-all"
            >
              CONFIRM
            </button>
          )}
          <button
            onClick={() => navigate(`/doctor/patients/${row.patientId?._id}/record?aptId=${row._id}`)}
            className="px-2 py-1 bg-indigo-tint text-indigo font-mono text-[10px] font-bold rounded border border-indigo/30 hover:bg-indigo hover:text-surface transition-all"
          >
            CHART
          </button>
          <button
            onClick={() => navigate(`/doctor/patients/${row.patientId?._id}/prescribe?aptId=${row._id}`)}
            className="px-2 py-1 bg-rust-tint text-rust font-mono text-[10px] font-bold rounded border border-rust/30 hover:bg-rust hover:text-surface transition-all"
          >
            PRESCRIBE
          </button>
        </div>
      )
    }
  ];

  return (
    <AppShell role="doctor">
      <ChartBar
        title={user?.name || 'Dr. Kabir Sen'}
        subtitle={`DEPT: ${doctorInfo?.department || 'Cardiology Ward'} · ROOM: ${doctorInfo?.roomNo || 'Room 302'} · TOTAL PATIENTS: ${queue.length}`}
        ward="indigo"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Stat Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="In Queue" value={inQueueCount} subtext="Waiting for consultation" ward="indigo" />
          <StatCard label="Completed Today" value={completedCount} subtext="Visits closed" ward="teal" />
          <StatCard label="Avg Consult Time" value="15m" subtext="Standard clinical window" ward="amber" />
          <StatCard label="Consultation Fee" value={`₹${doctorInfo?.consultationFee || 150}`} subtext="Standard OPD charge" ward="rust" />
        </div>

        <PulseDivider label="TODAY'S CLINICAL QUEUE & PATIENT APPOINTMENTS" />

        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-faint uppercase">
            LOADING CLINICAL QUEUE...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={queue}
            emptyMessage="NO PATIENTS IN QUEUE TODAY."
          />
        )}
      </div>
    </AppShell>
  );
}
