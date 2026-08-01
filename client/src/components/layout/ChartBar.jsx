import React from 'react';

export default function ChartBar({ title, subtitle, ward = 'teal', actions }) {
  const wardPill = {
    teal: { text: '● PATIENT WARD', bg: 'bg-teal-tint text-teal border-teal/20' },
    indigo: { text: '● DOCTOR WARD', bg: 'bg-indigo-tint text-indigo border-indigo/20' },
    rust: { text: '● ADMIN WARD', bg: 'bg-rust-tint text-rust border-rust/20' }
  }[ward] || { text: '● PATIENT WARD', bg: 'bg-teal-tint text-teal border-teal/20' };

  return (
    <div className="bg-surface border-b border-line px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink tracking-tight">{title}</h1>
        {subtitle && (
          <p className="font-mono text-xs text-sub tracking-wide uppercase mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <span className={`px-3 py-1 border rounded-full font-mono text-[10.5px] font-semibold tracking-wider ${wardPill.bg}`}>
          {wardPill.text}
        </span>
      </div>
    </div>
  );
}
