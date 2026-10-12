/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#04211F",
          900: "#0A2E2C",
          800: "#0E3B39",
          700: "#134B48",
          600: "#1A615D",
        },
        brand: {
          lime: "#D7FE63",
          limedark: "#BFE84A",
          teal: "#0E3B39",
          tealsoft: "#F1F6F5",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F5F7F7",
          border: "#E7ECEB",
        },
        state: {
          success: "#0E7C66",
          successbg: "#DFF3EC",
          pending: "#D9A441",
          pendingbg: "#FBF1DD",
          failed: "#E15252",
          failedbg: "#FBE6E6",
        },
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          dark: "rgb(var(--color-primary-dark) / <alpha-value>)",
          light: "rgb(var(--color-primary-light) / <alpha-value>)",
          50: "rgb(var(--color-primary) / 0.06)",
          100: "rgb(var(--color-primary) / 0.1)",
          200: "rgb(var(--color-primary) / 0.18)",
        },
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          dark: "rgb(var(--color-secondary-dark) / <alpha-value>)",
          light: "rgb(var(--color-secondary-light) / <alpha-value>)",
          50: "rgb(var(--color-secondary) / 0.1)",
          100: "rgb(var(--color-secondary) / 0.18)",
          200: "rgb(var(--color-secondary) / 0.3)",
        },
      },
      fontFamily: {
        sans: ["'Manrope'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(10, 46, 44, 0.06), 0 8px 24px -12px rgba(10, 46, 44, 0.10)",
      },
    },
  },
  plugins: [],
};
