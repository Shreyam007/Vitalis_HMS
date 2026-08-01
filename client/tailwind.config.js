/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        sub: 'var(--sub)',
        faint: 'var(--faint)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',

        teal: {
          DEFAULT: 'var(--teal)',
          deep: 'var(--teal-deep)',
          tint: 'var(--teal-tint)',
        },
        indigo: {
          DEFAULT: 'var(--indigo)',
          deep: 'var(--indigo-deep)',
          tint: 'var(--indigo-tint)',
        },
        rust: {
          DEFAULT: 'var(--rust)',
          deep: 'var(--rust-deep)',
          tint: 'var(--rust-tint)',
        },
        red: {
          DEFAULT: 'var(--red)',
          tint: 'var(--red-tint)',
        },
        amber: {
          DEFAULT: 'var(--amber)',
          tint: 'var(--amber-tint)',
        },
      },
      fontFamily: {
        display: ['"Instrument Sans"', 'sans-serif'],
        body: ['"Work Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '3px',
        md: '4px',
        lg: '6px',
        pill: '9999px',
      }
    },
  },
  plugins: [],
};
