/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        brand: {
          primary: 'var(--color-brand-primary)',
          core: 'var(--color-brand-core)',
          dark: 'var(--color-brand-dark)',
          deep: 'var(--color-brand-deep)',
          star: 'var(--color-brand-star)',
          layer1: 'var(--color-brand-layer-1)',
          layer2: 'var(--color-brand-layer-2)',
          layer3: 'var(--color-brand-layer-3)',
          layer4: 'var(--color-brand-layer-4)',
          layer5: 'var(--color-brand-layer-5)',
          layer6: 'var(--color-brand-layer-6)',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'Arial', 'sans-serif'],
        display: ['var(--font-inter)', 'var(--font-dm-sans)', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
