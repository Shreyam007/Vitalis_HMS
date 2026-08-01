import React from 'react';

export default function StatCard({ label, value, subtext, ward = 'teal', actionLink }) {
  const borderColor = {
    teal: 'border-t-teal',
    indigo: 'border-t-indigo',
    rust: 'border-t-rust',
    red: 'border-t-red',
    amber: 'border-t-amber'
  }[ward] || 'border-t-teal';

  return (
    <div className={`bg-surface border border-line border-t-[3px] ${borderColor} p-4 rounded-sm flex flex-col justify-between`}>
      <div>
        <p className="font-mono text-[10px] font-semibold text-sub uppercase tracking-wider mb-1">{label}</p>
        <p className="font-display text-2xl font-bold text-ink tracking-tight">{value}</p>
      </div>
      {(subtext || actionLink) && (
        <div className="mt-3 pt-2 border-t border-line flex items-center justify-between font-mono text-[11px] text-faint">
          {subtext && <span>{subtext}</span>}
          {actionLink && (
            <a href={actionLink.href} className="text-ink hover:underline font-semibold ml-auto">
              {actionLink.label} →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
