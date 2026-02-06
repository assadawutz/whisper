/**
 * Whisper Engine Tailwind Plugin
 * Custom utilities and components for Whisper UI
 */

const plugin = require("tailwindcss/plugin");

module.exports = plugin(
  function ({ addUtilities, addComponents, theme }) {
    // Gradient utilities
    addUtilities({
      ".gradient-ai": {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
      ".gradient-success": {
        background: "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)",
      },
      ".gradient-warning": {
        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      },
      ".gradient-info": {
        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      },
      ".gradient-dark": {
        background: "linear-gradient(135deg, #2c3e50 0%, #000000 100%)",
      },
      ".gradient-glow": {
        background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      },

      // Glass morphism
      ".glass": {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      },
      ".glass-strong": {
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      },

      // Neon effects
      ".neon-purple": {
        textShadow:
          "0 0 10px rgba(147, 51, 234, 0.8), 0 0 20px rgba(147, 51, 234, 0.6)",
      },
      ".neon-blue": {
        textShadow:
          "0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.6)",
      },
      ".neon-pink": {
        textShadow:
          "0 0 10px rgba(236, 72, 153, 0.8), 0 0 20px rgba(236, 72, 153, 0.6)",
      },

      // Animated gradients
      ".animate-gradient": {
        backgroundSize: "200% 200%",
        animation: "gradient 3s ease infinite",
      },
    });

    // Component styles
    addComponents({
      ".engine-card": {
        "@apply rounded-2xl border border-white/10 bg-gray-900/90 backdrop-blur-sm p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl":
          {},
      },
      ".engine-button": {
        "@apply px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95":
          {},
      },
      ".engine-button-primary": {
        "@apply engine-button bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600":
          {},
      },
      ".engine-button-secondary": {
        "@apply engine-button bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20":
          {},
      },
      ".engine-input": {
        "@apply w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all":
          {},
      },
      ".engine-badge": {
        "@apply inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold":
          {},
      },
      ".engine-badge-success": {
        "@apply engine-badge bg-green-500/20 text-green-400 border border-green-500/30":
          {},
      },
      ".engine-badge-error": {
        "@apply engine-badge bg-red-500/20 text-red-400 border border-red-500/30":
          {},
      },
      ".engine-badge-info": {
        "@apply engine-badge bg-blue-500/20 text-blue-400 border border-blue-500/30":
          {},
      },
      ".engine-stat-card": {
        "@apply relative overflow-hidden rounded-2xl p-[2px]": {},
        "& > div": {
          "@apply relative bg-gray-900 rounded-2xl p-6 h-full": {},
        },
      },
      ".engine-panel": {
        "@apply rounded-3xl border-2 border-white/10 bg-gradient-to-r from-gray-900 to-black p-8 shadow-2xl":
          {},
      },
      ".code-block": {
        "@apply rounded-lg bg-gray-950 p-4 font-mono text-sm overflow-x-auto border border-white/10":
          {},
      },
      ".scrollbar-thin": {
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "rgba(0, 0, 0, 0.1)",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(255, 255, 255, 0.2)",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "rgba(255, 255, 255, 0.3)",
        },
      },
    });
  },
  {
    theme: {
      extend: {
        colors: {
          engine: {
            primary: "#9333ea",
            secondary: "#ec4899",
            dark: "#0f0f0f",
            gray: {
              850: "#1a1a1a",
              950: "#0a0a0a",
            },
          },
        },
        animation: {
          gradient: "gradient 3s ease infinite",
          "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          float: "float 3s ease-in-out infinite",
        },
        keyframes: {
          gradient: {
            "0%, 100%": { backgroundPosition: "0% 50%" },
            "50%": { backgroundPosition: "100% 50%" },
          },
          float: {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-10px)" },
          },
        },
        fontFamily: {
          sans: ["Inter", "system-ui", "sans-serif"],
          mono: ["Fira Code", "monospace"],
        },
      },
    },
  },
);
