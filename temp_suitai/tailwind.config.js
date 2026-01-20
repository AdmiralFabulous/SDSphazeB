/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Primary (Deep Indigo)
        primary: "#1A237E",
        "on-primary": "#FFFFFF",
        "primary-container": "#DEE0FF",
        "on-primary-container": "#000F5C",

        // Secondary (Warm Amber)
        secondary: "#FF8F00",
        "on-secondary": "#FFFFFF",
        "secondary-container": "#FFDDB3",
        "on-secondary-container": "#2A1800",

        // Tertiary (Teal)
        tertiary: "#00695C",
        "on-tertiary": "#FFFFFF",
        "tertiary-container": "#A7F3EB",
        "on-tertiary-container": "#00201C",

        // Error
        error: "#BA1A1A",
        "on-error": "#FFFFFF",
        "error-container": "#FFDAD6",
        "on-error-container": "#410002",

        // Surface
        surface: "#FFFBFF",
        "on-surface": "#1C1B1F",
        "surface-variant": "#E7E0EC",
        "on-surface-variant": "#49454F",
        "surface-container": "#F3EDF7",
        "surface-container-high": "#ECE6F0",
        "surface-container-highest": "#E6E1E5",

        // Outline
        outline: "#79747E",
        "outline-variant": "#CAC4D0",

        // Risk colors (Holbaza)
        "risk-green": "#4CAF50",
        "risk-amber": "#FF9800",
        "risk-red": "#F44336",
        "risk-critical": "#B71C1C",

        // Track colors
        "track-a": "#1565C0",
        "track-b": "#C62828",
      },
      borderRadius: {
        none: "0px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "28px",
        full: "9999px",
      },
      boxShadow: {
        "elevation-1":
          "0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)",
        "elevation-2":
          "0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)",
        "elevation-3":
          "0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)",
        "elevation-4":
          "0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px rgba(0, 0, 0, 0.3)",
        "elevation-5":
          "0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)",
      },
      fontFamily: {
        brand: [
          "Google Sans",
          "Roboto",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        plain: [
          "Roboto",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        hindi: ["Noto Sans Devanagari", "Roboto", "sans-serif"],
        punjabi: ["Noto Sans Gurmukhi", "Roboto", "sans-serif"],
        mono: ["Roboto Mono", "SF Mono", "Monaco", "Consolas", "monospace"],
      },
      transitionDuration: {
        "short-1": "50ms",
        "short-2": "100ms",
        "short-3": "150ms",
        "short-4": "200ms",
        "medium-1": "250ms",
        "medium-2": "300ms",
        "medium-3": "350ms",
        "medium-4": "400ms",
      },
      zIndex: {
        drawer: "100",
        appbar: "200",
        modal: "300",
        snackbar: "400",
        tooltip: "500",
      },
      screens: {
        tablet: "600px",
        desktop: "905px",
        large: "1240px",
        xlarge: "1440px",
      },
    },
  },
  plugins: [],
};
