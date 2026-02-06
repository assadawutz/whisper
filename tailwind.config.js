/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./blueprint/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        brand: {
          primary: "#0A0B0D",
          secondary: "#00E0FF",
          accent: "#7000FF",
          muted: "#1E2025",
        },
        surface: {
          50: "#FAFBFC",
          100: "#F1F3F6",
          200: "#E2E5E9",
          900: "#0F1115",
        },
      },
      borderRadius: {
        premium: "1rem",
        "premium-lg": "2rem",
        "premium-xl": "3.5rem",
      },
      boxShadow: {
        premium: "0 20px 50px rgba(0,0,0,0.1)",
        "premium-hover": "0 30px 60px rgba(0,0,0,0.15)",
        glass:
          "inset 0 0 20px rgba(255,255,255,0.05), 0 10px 40px rgba(0,0,0,0.2)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "premium-mesh":
          "radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,10%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(190,49%,20%,1) 0, transparent 50%)",
      },
    },
  },
  plugins: [
    require('./tailwind-engine-plugin'),],
};
