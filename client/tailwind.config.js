/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#040711',
          900: '#070B19', // Main backdrop
          850: '#0A0F22',
          800: '#0D152F', // Card background
          750: '#111B3B', // Elevated card / border
          700: '#16234D',
          600: '#1E3068',
          blue: {
            DEFAULT: '#0070F3',
            hover: '#005ED4',
            glow: '#0084FF',
          },
          cyan: {
            DEFAULT: '#00D2FF',
            glow: '#38E1FF',
            dim: 'rgba(0, 210, 255, 0.2)',
          },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 210, 255, 0.35)',
        'glow-cyan-sm': '0 0 10px rgba(0, 210, 255, 0.25)',
        'glow-blue': '0 0 25px rgba(0, 112, 243, 0.4)',
        'cyber-card': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        'cyber-grid': "radial-gradient(circle, rgba(0, 210, 255, 0.08) 1px, transparent 1px)",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
