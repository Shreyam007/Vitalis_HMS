import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import ChartBar from '../../components/layout/ChartBar.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import PulseDivider from '../../components/ui/PulseDivider.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { FileText, Search, Pill, Upload, User } from 'lucide-react';

export default function DoctorRecords() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch('/api/clinical/patients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPatients(data);
        }
      } catch (err) {
        console.error('Fetch patients error for doctor:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [token]);

  const filteredPatients = patients.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      (p.userId?.name || '').toLowerCase().includes(q) ||
      (p.patientId || '').toLowerCase().includes(q) ||
      (p.bloodGroup || '').toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'PATIENT ID',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-indigo">{row.patientId}</span>
      )
    },
    {
      header: 'PATIENT NAME',
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
      header: 'ALLERGIES',
      cell: (row) => (
        <span className="font-mono text-[11px] text-red font-semibold">
          {row.allergies?.length > 0 ? row.allergies.join(', ') : 'None Reported'}
        </span>
      )
    },
    {
      header: 'ACTIONS',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/doctor/patients/${row._id}/record`)}
            className="px-2.5 py-1 bg-indigo-tint text-indigo font-mono text-[10.5px] font-bold rounded border border-indigo/30 hover:bg-indigo hover:text-surface transition-all"
          >
            VIEW CHART →
          </button>
          <button
            onClick={() => navigate(`/doctor/patients/${row._id}/prescribe`)}
            className="px-2.5 py-1 bg-rust-tint text-rust font-mono text-[10.5px] font-bold rounded border border-rust/30 hover:bg-rust hover:text-surface transition-all"
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
        title="Patient Clinical Records & Medical Histories"
        subtitle="PHYSICIAN PATIENT INDEX · DIAGNOSIS & MEDICAL RECORD SEARCH"
        ward="indigo"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Search Bar */}
        <div className="bg-surface border border-line p-4 rounded-sm flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient by name, PAT-ID, or blood group..."
            className="w-full text-sm font-body text-ink bg-transparent focus:outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="font-mono text-xs text-sub hover:text-ink uppercase font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        <PulseDivider label="PATIENT MASTER INDEX & CLINICAL HISTORY SEARCH" />

        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-faint uppercase">
            LOADING CLINICAL RECORDS INDEX...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredPatients}
            emptyMessage="NO PATIENT RECORDS MATCHING SEARCH CRITERIA."
          />
        )}
      </div>
    </AppShell>
  );
}
