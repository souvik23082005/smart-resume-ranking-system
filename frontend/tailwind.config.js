/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "secondary-fixed-dim": "#d2bbff",
        "on-error": "#690005",
        "secondary": "#d2bbff",
        "primary": "#c4c6cf",
        "tertiary-fixed-dim": "#4cd7f6",
        "tertiary": "#4cd7f6",
        "surface-dim": "#131313",
        "on-surface": "#e5e2e1",
        "on-tertiary-fixed-variant": "#004e5c",
        "on-primary-fixed": "#191c22",
        "surface-variant": "#353534",
        "on-secondary-container": "#c9aeff",
        "on-secondary-fixed": "#25005a",
        "tertiary-fixed": "#acedff",
        "outline-variant": "#45474b",
        "primary-container": "#0b0e14",
        "inverse-on-surface": "#313030",
        "on-secondary-fixed-variant": "#5a00c6",
        "on-background": "#e5e2e1",
        "surface-container-highest": "#353534",
        "surface-container-low": "#1c1b1b",
        "surface-container": "#201f1f",
        "error-container": "#93000a",
        "on-tertiary-fixed": "#001f26",
        "surface-bright": "#3a3939",
        "primary-fixed-dim": "#c4c6cf",
        "primary-fixed": "#e1e2eb",
        "on-secondary": "#3f008e",
        "surface-tint": "#c4c6cf",
        "error": "#ffb4ab",
        "on-primary-container": "#797b83",
        "surface": "#131313",
        "on-error-container": "#ffdad6",
        "tertiary-container": "#001015",
        "on-tertiary": "#003640",
        "on-primary-fixed-variant": "#44474e",
        "surface-container-lowest": "#0e0e0e",
        "secondary-fixed": "#eaddff",
        "inverse-primary": "#5c5e66",
        "outline": "#909095",
        "secondary-container": "#6001d1",
        "background": "#131313",
        "on-tertiary-container": "#00879e",
        "on-primary": "#2e3037",
        "inverse-surface": "#e5e2e1",
        "on-surface-variant": "#c6c6cb",
        "surface-container-high": "#2a2a2a",
        
        // Old colors needed for legacy animations
        'deep-black': '#050505',
        'brand-purple': '#7C3AED',
        'brand-purple-light': '#A78BFA',
        'neon-cyan': '#06B6D4',
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "margin-mobile": "16px",
        "base": "4px",
        "gutter": "24px",
        "margin-desktop": "40px",
        "container-max": "1440px"
      },
      fontFamily: {
        "body-lg": ["Inter", "sans-serif"],
        "label-sm": ["Geist", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "mono-data": ["JetBrains Mono", "monospace"],
        "headline-lg-mobile": ["Geist", "sans-serif"],
        "headline-lg": ["Geist", "sans-serif"],
        "headline-md": ["Geist", "sans-serif"]
      },
      fontSize: {
        "body-lg": ["18px", { "lineHeight": "1.6", "letterSpacing": "-0.01em", "fontWeight": "400" }],
        "label-sm": ["12px", { "lineHeight": "1.2", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "body-md": ["15px", { "lineHeight": "1.5", "letterSpacing": "0", "fontWeight": "400" }],
        "mono-data": ["14px", { "lineHeight": "1.4", "fontWeight": "500" }],
        "headline-lg-mobile": ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "headline-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.04em", "fontWeight": "700" }],
        "headline-md": ["24px", { "lineHeight": "1.3", "letterSpacing": "-0.02em", "fontWeight": "600" }]
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'resume-fly-away': 'resume-fly-away 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'splash-fade-out': 'splash-fade-out 0.8s ease forwards',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'resume-fly-away': {
          '0%': { transform: 'translateY(0) scale(1) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-150vh) scale(0.5) rotate(15deg)', opacity: '0' },
        },
        'splash-fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      }
    }
  },
  plugins: []
};
