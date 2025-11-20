/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ml-blue': '#1E6CF7',
        'ml-blue-hover': '#1a5fe0',
        'ml-blue-alt': '#3483fa',
        'ml-blue-alt-hover': '#2968c8',
        'ml-green': '#00a650',
        'ml-yellow': '#ffe600',
        'ml-muted': '#9b9b9b',
        'ml-border': '#e6e6e6',
        'ml-bg': '#fafafa',
      },
      fontFamily: {
        sans: ['Proxima Nova', '-apple-system', 'Roboto', 'Arial', 'sans-serif'],
        navigation: ['Navigation', 'sans-serif'],
      },
      borderRadius: {
        'ml': '10px',
      },
    },
  },
  plugins: [],
}

