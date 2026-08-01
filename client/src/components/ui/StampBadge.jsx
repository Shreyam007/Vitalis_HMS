import React from 'react';

export default function StampBadge({ status = 'pending', text }) {
  const normalizedStatus = status.toLowerCase();
  
  const statusStyles = {
    pending: 'border-amber bg-amber-tint text-amber',
    confirmed: 'border-teal bg-teal-tint text-teal',
    completed: 'border-indigo bg-indigo-tint text-indigo',
    cancelled: 'border-red bg-red-tint text-red',
    paid: 'border-teal bg-teal-tint text-teal',
    unpaid: 'border-red bg-red-tint text-red'
  };

  const currentStyle = statusStyles[normalizedStatus] || statusStyles.pending;
  const displayText = text || normalizedStatus.toUpperCase();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border-[1.5px] rounded font-mono text-[10px] font-semibold uppercase tracking-wider -rotate-2 select-none ${currentStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {displayText}
    </span>
  );
}
