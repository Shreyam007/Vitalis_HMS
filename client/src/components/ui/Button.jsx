import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  ward = 'ink', 
  type = 'button', 
  onClick, 
  disabled = false,
  className = '',
  icon: Icon
}) {
  const baseStyle = "inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider rounded-sm transition-all border focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const wardStyles = {
    ink: {
      primary: 'bg-ink text-surface border-ink hover:bg-black',
      ghost: 'bg-transparent text-ink border-line hover:border-ink hover:bg-ink/5'
    },
    teal: {
      primary: 'bg-teal text-surface border-teal hover:bg-teal-deep',
      ghost: 'bg-transparent text-teal border-teal/30 hover:border-teal hover:bg-teal-tint'
    },
    indigo: {
      primary: 'bg-indigo text-surface border-indigo hover:bg-indigo-deep',
      ghost: 'bg-transparent text-indigo border-indigo/30 hover:border-indigo hover:bg-indigo-tint'
    },
    rust: {
      primary: 'bg-rust text-surface border-rust hover:bg-rust-deep',
      ghost: 'bg-transparent text-rust border-rust/30 hover:border-rust hover:bg-rust-tint'
    },
    red: {
      primary: 'bg-red text-surface border-red hover:bg-red/90',
      ghost: 'bg-transparent text-red border-red/30 hover:border-red hover:bg-red-tint'
    }
  };

  const styleClass = (wardStyles[ward] || wardStyles.ink)[variant] || wardStyles.ink.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${styleClass} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{children}</span>
      {variant === 'primary' && <span className="font-sans">→</span>}
    </button>
  );
}
