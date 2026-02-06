import type { Config } from "tailwindcss";
export default {
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-sans)"], th: ["var(--font-th)"] },
      colors: {
        bg: "rgb(var(--bg)/<alpha-value>)",
        surface: "rgb(var(--surface)/<alpha-value>)",
        muted: "rgb(var(--muted)/<alpha-value>)",
        border: "rgb(var(--border)/<alpha-value>)",
        title: "rgb(var(--title)/<alpha-value>)",
        subtitle: "rgb(var(--subtitle)/<alpha-value>)",
        detail: "rgb(var(--detail)/<alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary)/<alpha-value>)",
          fg: "rgb(var(--primary-fg)/<alpha-value>)",
        },
      },
      borderRadius: { md: "var(--radius-md)", lg: "var(--radius-lg)" },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
} satisfies Config;
