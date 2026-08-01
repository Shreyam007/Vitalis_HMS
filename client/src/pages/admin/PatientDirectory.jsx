import React, { useState, useEffect } from 'react';
import AppShell from '../../components/layout/AppShell.jsx';
import ChartBar from '../../components/layout/ChartBar.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function PatientDirectory() {
  const { token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch('/api/admin/patients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPatients(data);
        }
      } catch (err) {
        console.error('Fetch patients directory error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [token]);

  const columns = [
    {
      header: 'PATIENT ID',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-teal">{row.patientId}</span>
      )
    },
    {
      header: 'NAME / EMAIL',
      cell: (row) => (
        <div>
          <p className="font-body text-xs font-bold text-ink">{row.userId?.name || 'Patient'}</p>
          <p className="font-mono text-[10px] text-faint">{row.userId?.email || 'N/A'}</p>
        </div>
      )
    },
    {
      header: 'BLOOD GRP',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-ink">{row.bloodGroup || 'N/A'}</span>
      )
    },
    {
      header: 'PHONE',
      cell: (row) => (
        <span className="font-mono text-xs text-sub">{row.phone || 'N/A'}</span>
      )
    },
    {
      header: 'WRISTBAND CODE',
      cell: (row) => (
        <span className="font-mono text-xs text-indigo font-bold bg-indigo-tint/50 px-2 py-0.5 border border-indigo/20 rounded">
          {row.wristbandCode || 'N/A'}
        </span>
      )
    }
  ];

  return (
    <AppShell role="admin">
      <ChartBar
        title="Patient Master Directory"
        subtitle="ADMINISTRATION WARD · REGISTERED PATIENTS & WRISTBAND INDEX"
        ward="rust"
      />

      <div className="p-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-faint uppercase">
            LOADING PATIENT MASTER DIRECTORY...
          </div>
        ) : (
          <DataTable columns={columns} data={patients} emptyMessage="NO REGISTERED PATIENTS FOUND." />
        )}
      </div>
    </AppShell>
  );
}
