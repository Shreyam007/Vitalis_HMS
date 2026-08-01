import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import ChartBar from '../../components/layout/ChartBar.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Upload, FileText, CheckCircle } from 'lucide-react';

export default function AttachTestReport() {
  const { id } = useParams(); // patientId
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('Blood Work & Lipid Profile');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('patientId', id);
      formData.append('title', title);
      formData.append('notes', notes);
      formData.append('reportFile', file);

      const res = await fetch('/api/clinical/test-reports', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      navigate(`/doctor/patients/${id}/record`);
    } catch (err) {
      setError(err.message || 'Failed to upload report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell role="doctor">
      <ChartBar
        title="Attach Diagnostic Test Report"
        subtitle="UPLOAD LAB RESULT PDF / IMAGING REPORT TO PATIENT CHART"
        ward="indigo"
      />

      <div className="p-6 max-w-xl mx-auto space-y-6">
        <form onSubmit={handleSubmit} className="bg-surface border border-line p-6 rounded-sm space-y-4">
          {error && (
            <div className="p-3 bg-red-tint border border-red/30 rounded font-mono text-xs text-red">
              {error}
            </div>
          )}

          <div>
            <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
              Report Title / Test Category *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Blood Count (CBC), Chest X-Ray"
              className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:border-indigo"
            />
          </div>

          <div>
            <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
              Diagnostic File (PDF / Image) *
            </label>
            <div className="border-2 border-dashed border-line p-6 rounded text-center bg-bg/40">
              <Upload className="w-8 h-8 text-faint mx-auto mb-2" />
              <input
                type="file"
                required
                accept="application/pdf,image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-xs text-sub file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-mono file:bg-indigo file:text-surface"
              />
              {file && (
                <p className="mt-2 font-mono text-xs text-indigo font-bold">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
              Clinical Interpretation / Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Physician notes on test results..."
              className="w-full p-3 border border-line rounded text-sm font-body text-ink focus:border-indigo"
            />
          </div>

          <div className="pt-2 flex justify-between items-center">
            <Button type="button" variant="ghost" ward="ink" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" ward="indigo" disabled={loading}>
              {loading ? 'UPLOADING...' : 'ATTACH REPORT TO CHART'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
