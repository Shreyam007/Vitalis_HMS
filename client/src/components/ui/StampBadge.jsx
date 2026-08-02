import React from 'react';

export default function StampBadge({ status = 'pending', text, delayed = false, animate = true }) {
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
  const animClass = animate ? (delayed ? 'animate-stamp-delayed' : 'animate-stamp') : '';

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 border-[2px] rounded font-mono text-[10.5px] font-bold uppercase tracking-widest select-none ${currentStyle} ${animClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block animate-pulse" />
      {displayText}
    </span>
  );
}
