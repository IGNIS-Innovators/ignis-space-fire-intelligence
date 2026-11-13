/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ignis: {
          bg: '#050914',
          sidebar: '#070B15',
          surface: '#0D1422',
          'surface-2': '#101B2B',
          'surface-card': 'rgba(13, 20, 34, 0.75)',
          border: '#213047',
          'border-light': '#2F4563',
          text: '#F4F8FF',
          muted: '#93A3BB',
          orange: '#FF641C',
          'orange-hot': '#FF8D36',
          'orange-glow': 'rgba(255, 100, 28, 0.25)',
          cyan: '#36B8FF',
          'cyan-glow': 'rgba(54, 184, 255, 0.2)',
          green: '#35D2A0',
          'green-glow': 'rgba(53, 210, 160, 0.2)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-orange': '0 0 25px rgba(255, 100, 28, 0.35)',
        'glow-cyan': '0 0 25px rgba(54, 184, 255, 0.25)',
        'panel': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at 50% 50%, rgba(255, 100, 28, 0.15) 0%, transparent 70%)',
        'radial-cyan': 'radial-gradient(circle at 50% 50%, rgba(54, 184, 255, 0.12) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
