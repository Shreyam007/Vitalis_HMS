import React, { useState } from 'react';
import AppShell from '../../components/layout/AppShell.jsx';
import ChartBar from '../../components/layout/ChartBar.jsx';
import PulseDivider from '../../components/ui/PulseDivider.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Download, FileText, Calendar } from 'lucide-react';

export default function ReportsExport() {
  const { token } = useAuth();
  const [reportType, setReportType] = useState('appointments');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const handleDownload = () => {
    const url = `/api/admin/reports/export?reportType=${reportType}&token=${encodeURIComponent(token)}`;
    window.open(url, '_blank');
  };

  return (
    <AppShell role="admin">
      <ChartBar
        title="Reports & CSV Data Export"
        subtitle="ADMINISTRATION WARD · CLINICAL AUDIT & DATA EXPORT ENGINE"
        ward="rust"
      />

      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="bg-surface border-2 border-line p-8 rounded-sm shadow-sm space-y-6">
          <div>
            <h3 className="font-display font-bold text-xl text-ink">Generate System Audit Report</h3>
            <p className="font-mono text-xs text-sub mt-1">Export hospital master records in standard CSV format for external analysis.</p>
          </div>

          <PulseDivider label="REPORT CONFIGURATION" />

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
                  onClick={() => setReportType(item.id)}
                  className={`p-4 border rounded text-left transition-all ${
                    reportType === item.id 
                      ? 'border-rust bg-rust-tint/50 text-rust font-bold' 
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

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-mono text-[10.5px] uppercase font-semibold text-sub mb-1">
                Start Date Filter
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
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
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-line rounded text-sm font-body text-ink focus:border-rust"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-line">
            <Button variant="primary" ward="rust" icon={Download} onClick={handleDownload}>
              DOWNLOAD CSV REPORT (UTF-8)
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
