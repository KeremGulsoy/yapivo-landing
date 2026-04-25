/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'yapivo-dark': '#1B2E5E',
        'yapivo-amber': '#E8870A',
        'yapivo-cream': '#F8F7F4',
        'yapivo-blue': '#2A4580',
      },
      fontFamily: {
        outfit: ['var(--font-outfit)'],
      },
    },
  },
  plugins: [],
}