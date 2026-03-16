/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Status colors as per spec
        status: {
          quoted: '#6B7280',    // Gray
          scheduled: '#3B82F6', // Blue
          inProgress: '#F59E0B', // Amber
          completed: '#10B981', // Green
          cancelled: '#EF4444', // Red
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
