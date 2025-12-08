/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      sm: "480px",
      // => @media (min-width: 640px) { ... }

      md: "578px",
      // => @media (min-width: 768px) { ... }

      lg: "768px",
      // => @media (min-width: 1024px) { ... }

      xl: "1020px",
      // => @media (min-width: 1280px) { ... }

      "2xl": "1636px",
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
      colors: {
        // The core "Foundation" color - used for Headers/Navs
        hcl: {
          navy: "#090033", // Deep Navy for headers
          blue: "#1C47FF", // Primary Brand Blue for links/buttons
          magenta: "#E3165B", // "Spark" Pink/Magenta for CTAs and alerts
          cyan: "#00F0FF", // Tech Cyan for accents
          purple: "#5D2E8E", // Secondary purple for gradients
          gray: "#F9FAFB", // Light gray for main background (Canvas)
        },
      },
      backgroundImage: {
        // The signature HCLTech "Spark" gradient
        "hcl-gradient": "linear-gradient(90deg, #5D2E8E 0%, #E3165B 100%)",
        "hcl-blue-gradient":
          "linear-gradient(135deg, #1C47FF 0%, #00F0FF 100%)",
      },
      fontFamily: {
        // 'Inter' is the closest free Google Font to HCLTech's 'Roobert'
        sans: ["Inter", "Roboto", "sans-serif"],
      },
      borderRadius: {
        // HCLTech uses sharper, more professional edges (not fully rounded)
        hcl: "4px",
        card: "6px",
      },
      boxShadow: {
        // Subtle, diffused shadows for white cards
        "hcl-card": "0 2px 8px 0 rgba(9, 0, 51, 0.08)",
      },
    },
  },
  plugins: [],
};
