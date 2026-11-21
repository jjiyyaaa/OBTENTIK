/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./frontend-exports/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Healthcare Navy
        navy: {
          950: "#080D1A",
          900: "#0F172A", // Deep Navy
          850: "#172239",
          800: "#1E293B", // Navy Secondary
          700: "#334155",
          600: "#475569",
          500: "#64748B",
        },
        // Healthcare Teal & Mint
        teal: {
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6", // Primary Accent Teal
          600: "#0D9488", // Deep Teal
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
        },
        // Futuristic Soft Cyan & Sky
        cyan: {
          50: "#F0F9FF",
          100: "#E0F2FE", // Icy Blue
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8", // Soft Cyan
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
        },
        // Medical Brand Blues (Maintained for backwards-compat)
        brand: {
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0284C7",
          600: "#0369A1", // Primary Trust Blue
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#0F172A",
        },
        surface: {
          50: "#F8FAFC",  // Clean light canvas
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
      boxShadow: {
        medical: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px 0 rgba(15, 23, 42, 0.03)",
        "medical-card": "0 4px 12px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)",
        "medical-lg": "0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.03)",
        "glow-teal": "0 0 24px -4px rgba(20, 184, 166, 0.28)",
        "glow-cyan": "0 0 24px -4px rgba(56, 189, 248, 0.28)",
        glass: "0 8px 30px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};
