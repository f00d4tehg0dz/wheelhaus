/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  safelist: [
    'bg-red-800',
    'hover:bg-red-700',
    'bg-green-500',
    'hover:bg-green-700',
    'bg-blue-500',
    'hover:bg-blue-700',
    'bg-gray-900',
    'hover:bg-gray-700',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

