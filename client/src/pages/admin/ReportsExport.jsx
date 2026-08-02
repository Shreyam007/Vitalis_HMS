import React, { useState, useEffect } from 'react';
import AppShell from '../../components/layout/AppShell.jsx';
import ChartBar from '../../components/layout/ChartBar.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import PulseDivider from '../../components/ui/PulseDivider.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Download, FileText, Calendar, Loader2, AlertCircle, CheckCircle, Database } from 'lucide-react';

export default function ReportsExport() {
  const { token } = useAuth();
  const [reportType, setReportType] = useState('appointments');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [downloading, setDownloading] = useState(false);
  const [zeroRecordsNote, setZeroRecordsNote] = useState('');
  const [totalExports24h, setTotalExports24h] = useState(0);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/export/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTotalExports24h(data.totalExports24h || 0);
      }
    } catch (err) {
      console.error('Fetch export stats error:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  const handleDownload = async () => {
    setZeroRecordsNote('');
    setDownloading(true);

    try {
      const endpoint = `/api/admin/export/${reportType}?startDate=${startDate}&endDate=${endDate}`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('CSV Export generation failed');
      }

      const countHeader = res.headers.get('X-Record-Count');
      const count = countHeader ? parseInt(countHeader, 10) : -1;

      if (count === 0) {
        setZeroRecordsNote('No records in this range');
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = `vitalis_${reportType}_${startDate}_${endDate}.csv`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      // Trigger Browser File Download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Refresh export log count
      fetchStats();
    } catch (err) {
      console.error('CSV Download error:', err);
      setZeroRecordsNote('Failed to download CSV report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AppShell role="admin">
      <ChartBar
        title="Reports & CSV Data Export Engine"
        subtitle="ADMINISTRATION WARD · CLINICAL AUDIT & STREAMING DATA EXPORT"
        ward="rust"
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Real-time 24h Export Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="TOTAL EXPORTS (24H)"
            value={totalExports24h.toString()}
            subtitle="Logged export audit events"
            ward="rust"
          />
          <StatCard
            title="CSV ENCODING"
            value="UTF-8 BOM"
            subtitle="Excel symbol compatible"
            ward="rust"
          />
          <StatCard
            title="DATASET AUDIT"
            value="3 SCHEMAS"
            subtitle="Indexed sequential rows"
            ward="rust"
          />
        </div>

        <div className="bg-surface border-2 border-line p-8 rounded-sm shadow-sm space-y-6 animate-fade-in">
          <div>
            <h3 className="font-display font-bold text-xl text-ink">Generate System Audit Report</h3>
            <p className="font-mono text-xs text-sub mt-1">Export hospital master records in standard CSV format with UTF-8 BOM encoding for external analysis.</p>
          </div>

          <PulseDivider label="REPORT CONFIGURATION & FILTERS" />

          {/* Select Report Type */}
          <div>
            <label className="block font-mono text-xs font-bold uppercase text-sub tracking-wider mb-2">
              Select Dataset Category
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'appointments', label: 'Appointments Log', desc: 'OPD visits & queue statuses' },
                { id: 'patients', label: 'Patient Master Index', desc: 'Registered patients & wristbands' },
                { id: 'doctors', label: 'Physician Staff Roster', desc: 'Departments, rooms & fees' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setReportType(item.id);
                    setZeroRecordsNote('');
                  }}
                  className={`p-4 border rounded text-left transition-all ${
                    reportType === item.id 
                      ? 'border-rust bg-rust-tint/50 text-rust font-bold shadow-sm' 
                      : 'border-line text-ink hover:border-line-strong'
                  }`}
                >
                  <FileText className="w-4 h-4 mb-2 text-rust" />
                  <p className="font-mono text-xs uppercase">{item.label}</p>
                  <p className="font-body text-[11px] text-sub font-normal mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
                Start Date Filter
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setZeroRecordsNote('');
                }}
                className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:border-rust"
              />
            </div>
            <div>
              <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
                End Date Filter
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setZeroRecordsNote('');
                }}
                className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:border-rust"
              />
            </div>
          </div>

          {/* Action Row & Inline Zero Records Warning */}
          <div className="pt-4 flex items-center justify-between border-t border-line">
            <div>
              {zeroRecordsNote && (
                <div className="flex items-center gap-1.5 font-mono text-xs text-amber font-semibold bg-amber-tint px-3 py-1.5 rounded border border-amber/30">
                  <AlertCircle className="w-4 h-4" />
                  <span>{zeroRecordsNote}</span>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              ward="rust"
              onClick={handleDownload}
              disabled={downloading}
              icon={downloading ? Loader2 : Download}
            >
              {downloading ? 'PREPARING EXPORT...' : 'DOWNLOAD CSV REPORT (UTF-8)'}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
