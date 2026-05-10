/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#ecff9f',
          green: '#6a6b29',
          'light-green': '#d2d388',
          gold: '#f3be41',
          lavender: '#deccda',
          'fresh-green': '#daf4a2',
          pink: '#f2cdd0',
          blue: '#7ba3d6',
          'light-blue': '#cbd9ea',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        heading: ['var(--font-heading)', '"Source Han Serif CN"', '"Noto Serif SC"', 'serif'],
        body: ['var(--font-body)', '"Source Han Serif CN"', '"Noto Serif SC"', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
