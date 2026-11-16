import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF7',
          100: '#FBF8F3', // Primary Base
          200: '#F5EFEB',
          300: '#EBE3DA',
          400: '#DFD4C7',
          500: '#CDBFAF',
        },
        forest: {
          50: '#EBF2EE',
          100: '#D2E3D8',
          200: '#A4C6B1',
          300: '#6FA483',
          400: '#3D7856',
          500: '#183B2B', // Secondary Brand
          600: '#133023',
          700: '#11291E',
          800: '#0C1F16',
          900: '#07130E',
        },
        gold: {
          50: '#FAF6ED',
          100: '#F3ECD2',
          200: '#E6D7A5',
          300: '#D7BF75',
          400: '#C5A869', // Accent Muted Gold
          500: '#B6934A',
          600: '#987738',
          700: '#755A2A',
          800: '#533E1D',
          900: '#342611',
        },
        charcoal: {
          800: '#2A2F2B',
          900: '#1A1E1B',
        }
      },
      fontFamily: {
        poppins: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
        serif: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
        sans: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(24, 59, 43, 0.08)',
        'luxury-hover': '0 20px 40px -15px rgba(24, 59, 43, 0.15)',
        'gold-glow': '0 0 25px rgba(197, 168, 105, 0.25)',
      }
    },
  },
  plugins: [],
};
export default config;

