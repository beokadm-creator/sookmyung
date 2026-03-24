/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Sookmyung Official Brand Colors (Pantone-based)
        sookmyung: {
          // Pantone 287C - Sookmyung Royal Blue
          blue: {
            50: "#e6f0fa",
            100: "#cce0f5",
            200: "#99c2eb",
            300: "#66a3e0",
            400: "#3385d6",
            500: "#0072CE", // Pantone 285C - Light Blue
            600: "#005bb3",
            700: "#004499",
            800: "#003087", // Pantone 287C - Primary Blue
            900: "#002066",
            950: "#001033",
          },
          // Pantone Cool Gray 10C - Dark Gray
          gray: {
            50: "#f5f5f5",
            100: "#e8e8e8",
            200: "#d1d1d1",
            300: "#b0b0b0",
            400: "#888888",
            500: "#6e6e6e",
            600: "#636569", // Dark Gray
            700: "#515155",
            800: "#404041",
            900: "#2d2d2e",
            950: "#161617",
          },
          // Pantone Cool Gray 7C - SMU Gray
          smu: {
            50: "#f9f9f9",
            100: "#f2f2f2",
            200: "#e5e5e5",
            300: "#d1d1d1",
            400: "#b8b8b8",
            500: "#9e9e9e",
            600: "#97999B", // SMU Gray
            700: "#7d7e80",
            800: "#636364",
            900: "#4a4a4b",
            950: "#252526",
          },
          // Pantone Cool Gray 1C - Light Gray
          light: {
            50: "#fafafa",
            100: "#f6f6f6",
            200: "#ededed",
            300: "#e0e0e0",
            400: "#cdcdcd",
            500: "#b3b3b3",
            600: "#999999",
            700: "#7a7a7a",
            800: "#5c5c5d",
            900: "#3d3d3e",
            950: "#1e1e1f",
          },
          // 120th Anniversary Colors
          anniversary: {
            50: "#e6ecf5",
            100: "#ccd9eb",
            200: "#99b3d7",
            300: "#668cc3",
            400: "#3366af",
            500: "#465E98", // Blueberry Pie
            600: "#384b7a",
            700: "#2b395c",
            800: "#1d283d",
            900: "#101a26",
            950: "#080d13",
          },
          hydrangea: {
            50: "#e8eaf5",
            100: "#d1d5eb",
            200: "#a3abd7",
            300: "#7580c3",
            400: "#4856af",
            500: "#849BCC", // Hydrangea Blue
            600: "#687ca3",
            700: "#4d5d7a",
            800: "#333e52",
            900: "#1a2029",
            950: "#0d1014",
          },
          lacecap: {
            50: "#eef2fa",
            100: "#dce5f5",
            200: "#b9cbeb",
            300: "#96b1e1",
            400: "#7397d7",
            500: "#96B3DE", // Lacecap Hydrangea Blue
            600: "#788fb1",
            700: "#5a6b85",
            800: "#3c4759",
            900: "#1e242c",
            950: "#0f1216",
          },
        },
        // Legacy gold colors (kept for compatibility)
        sookmyunglegacy: {
          gold: {
            50: "#fefde8",
            100: "#fdfbd1",
            200: "#fbf7a3",
            300: "#f9f275",
            400: "#f7ed47",
            500: "#D4AF37", // Anniversary Gold
            600: "#aa8c2c",
            700: "#806921",
            800: "#554616",
            900: "#2b230b",
            950: "#151105",
          },
        },
      },
      fontFamily: {
        sans: [
          '"Noto Sans KR"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        serif: [
          '"Noto Serif KR"',
          "Georgia",
          "Cambria",
          '"Times New Roman"',
          "Times",
          "serif",
        ],
      },
      fontSize: {
        "xxs": "0.625rem", // 10px
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "soft": "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        "glow": "0 0 20px rgba(0, 48, 135, 0.15)",
        "gold-glow": "0 0 20px rgba(212, 175, 55, 0.3)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-to-br-from-blue": "linear-gradient(to bottom right, var(--tw-gradient-stops))",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [],
};
