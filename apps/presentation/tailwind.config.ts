import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ut: {
          blue: '#315cfd',       // primary CTA / accent
          navy: '#000d90',       // deep brand navy
          'navy-dark': '#0c163d', // near-black navy for backgrounds
          teal: '#28dcd1',       // accent / highlight
          slate: '#415a79',      // secondary text
          'blue-light': '#d0e0f7', // light blue tint for backgrounds
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        'fade-up': 'fadeUp 0.45s ease-out both',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
