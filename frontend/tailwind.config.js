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
          bg: '#050B18',
          'bg-deep': '#030710',
          sidebar: '#070D1B',
          surface: '#0B1528',
          'surface-2': '#0F1E38',
          'surface-card': 'rgba(11, 21, 40, 0.72)',
          border: '#1E3252',
          'border-light': '#2B4670',
          text: '#EAF2FF',
          muted: '#9FB0C8',
          orange: '#FF6B35',
          'orange-hot': '#FF8A50',
          'orange-glow': 'rgba(255, 107, 53, 0.28)',
          cyan: '#40C9FF',
          'cyan-glow': 'rgba(64, 201, 255, 0.22)',
          green: '#2EE59D',
          'green-glow': 'rgba(46, 229, 157, 0.22)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-orange': '0 0 30px rgba(255, 107, 53, 0.35)',
        'glow-cyan': '0 0 30px rgba(64, 201, 255, 0.25)',
        'glow-green': '0 0 25px rgba(46, 229, 157, 0.25)',
        'panel': '0 12px 40px 0 rgba(0, 0, 0, 0.65)',
        'card-hover': '0 16px 45px -8px rgba(0, 0, 0, 0.75), 0 0 25px rgba(64, 201, 255, 0.15)',
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at 50% 50%, rgba(255, 107, 53, 0.18) 0%, transparent 70%)',
        'radial-cyan': 'radial-gradient(circle at 50% 50%, rgba(64, 201, 255, 0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
