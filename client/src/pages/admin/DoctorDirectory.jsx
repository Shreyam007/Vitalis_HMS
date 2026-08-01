import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import ChartBar from '../../components/layout/ChartBar.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function DoctorDirectory() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/admin/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (err) {
      console.error('Fetch doctors error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await fetch(`/api/admin/doctors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDoctors();
    } catch (err) {
      console.error('Delete doctor error:', err);
    }
  };

  const columns = [
    {
      header: 'DOCTOR ID',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-rust">{row.doctorId}</span>
      )
    },
    {
      header: 'NAME / QUALIFICATION',
      cell: (row) => (
        <div>
          <p className="font-body text-xs font-bold text-ink">{row.name}</p>
          <p className="font-mono text-[10px] text-faint uppercase">{row.qualification} · {row.experienceYears}y Exp</p>
        </div>
      )
    },
    {
      header: 'SPECIALIZATION',
      accessor: 'specialization'
    },
    {
      header: 'DEPARTMENT',
      cell: (row) => (
        <span className="font-mono text-xs text-sub">{row.department}</span>
      )
    },
    {
      header: 'ROOM / FEE',
      cell: (row) => (
        <span className="font-mono text-xs text-ink">{row.roomNo} · ₹{row.consultationFee}</span>
      )
    },
    {
      header: 'ACTIONS',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/doctors/${row._id}/edit`)}
            className="p-1.5 text-rust hover:bg-rust-tint rounded border border-rust/30"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-1.5 text-red hover:bg-red-tint rounded border border-red/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <AppShell role="admin">
      <ChartBar
        title="Physician & Doctor Directory"
        subtitle="ADMINISTRATION WARD · CLINICAL STAFF MANAGEMENT"
        ward="rust"
        actions={
          <Button variant="primary" ward="rust" icon={Plus} onClick={() => navigate('/admin/doctors/new')}>
            Add New Doctor
          </Button>
        }
      />

      <div className="p-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-faint uppercase">
            LOADING DOCTOR DIRECTORY...
          </div>
        ) : (
          <DataTable columns={columns} data={doctors} emptyMessage="NO DOCTORS FOUND IN DIRECTORY." />
        )}
      </div>
    </AppShell>
  );
}
