/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tech-dark': '#0a1929',
        'tech-blue': '#00d4ff',
        'tech-cyan': '#00fff7',
        'tech-purple': '#a855f7',
        'tech-success': '#22C55E',
        'tech-warning': '#f59e0b',
        'tech-danger': '#EF4444',
        'dashboard-blue': '#00e5ff',
        'dashboard-bg': 'rgba(10, 25, 50, 0.7)',
        'border-glow': 'rgba(0, 229, 255, 0.4)',
        'bg-primary': '#0F172A',
        'bg-card': '#1B2336',
        'text-primary': '#F8FAFC',
        'text-muted': '#94A3B8',
        'border-default': '#475569',
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body: ['Exo 2', 'Microsoft YaHei', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-tech': 'linear-gradient(135deg, #0a1929 0%, #1a2332 100%)',
      },
    },
  },
  plugins: [],
}
