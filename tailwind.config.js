/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'panel-expand': {
          '0%': { opacity: '0', transform: 'scale(0.6)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'text-type-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'panel-expand': 'panel-expand 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'text-type-blink': 'text-type-blink 0.5s steps(1) infinite',
      },
    },
  },
  plugins: [],
}
