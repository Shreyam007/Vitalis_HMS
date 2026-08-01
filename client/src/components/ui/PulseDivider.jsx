import React from 'react';
import { Activity } from 'lucide-react';

export default function PulseDivider({ label }) {
  return (
    <div className="relative my-6 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-line" />
      </div>
      <div className="relative bg-bg px-3 flex items-center gap-2 text-faint">
        <Activity className="w-4 h-4 text-teal animate-pulse" />
        {label && (
          <span className="font-mono text-[10.5px] uppercase tracking-wider font-semibold text-sub">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
