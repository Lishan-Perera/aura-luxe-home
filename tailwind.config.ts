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
        primary: {
          DEFAULT: '#123C2F',
          hover: '#0D2E24',
          light: '#194D3D',
        },
        ivory: '#FBF8F3',
        sage: {
          DEFAULT: '#E9EDE7',
          50: '#F4F6F3',
          100: '#E9EDE7',
          200: '#D9E0D6',
          300: '#C2CDC0',
        },
        softgrey: '#D9D9D4',
        cream: {
          50: '#FFFFFF',
          100: '#FBF8F3',
          200: '#E9EDE7',
          300: '#D9D9D4',
          400: '#BFBFB9',
          500: '#9A9A94',
        },
        forest: {
          50: '#F2F6F4',
          100: '#E9EDE7',
          200: '#CEDBD4',
          300: '#9BB9AC',
          400: '#588674',
          500: '#275E4B',
          600: '#194D3D',
          700: '#123C2F',
          800: '#0D2E24',
          900: '#123C2F',
          950: '#0A241C',
        },
        charcoal: {
          500: '#666666',
          600: '#555555',
          700: '#444444',
          800: '#333333',
          900: '#222222',
        },
      },
      fontFamily: {
        poppins: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
        serif: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
        sans: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(18, 60, 47, 0.05)',
        'luxury': '0 4px 16px rgba(18, 60, 47, 0.06)',
        'luxury-hover': '0 8px 24px rgba(18, 60, 47, 0.10)',
      },
    },
  },
  plugins: [],
};
export default config;
