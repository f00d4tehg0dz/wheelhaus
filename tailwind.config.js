/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  safelist: [
    'bg-brand-sky',
    'bg-brand-navy',
    'bg-brand-ink',
    'bg-brand-coral',
    'bg-brand-cream',
    'bg-brand-gold',
    'bg-brand-paper',
    'hover:bg-brand-coral',
    'hover:bg-brand-gold',
    'hover:bg-brand-navy',
    'text-brand-sky',
    'text-brand-navy',
    'text-brand-coral',
    'text-brand-cream',
    'text-brand-gold',
    'text-brand-paper',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          sky:   '#39A9E0',
          navy:  '#1B2660',
          ink:   '#0F1435',
          coral: '#E85A47',
          cream: '#F1E6D3',
          gold:  '#F4B821',
          paper: '#FBF7EE',
        },
      },
      fontFamily: {
        display: ['"Fredoka"', '"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brand-pop': '4px 4px 0 0 #1B2660',
        'brand-pop-sm': '2px 2px 0 0 #1B2660',
      },
    },
  },
  plugins: [],
}
