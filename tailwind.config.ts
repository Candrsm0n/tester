import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1360px",
      },
    },
    extend: {
      colors: {
        navy: {
          950: "#050814",
          900: "#0A0F24",
          800: "#111936",
          700: "#1A254B",
        },
        neon: {
          purple: "#8B5CF6",
          violet: "#A855F7",
          blue: "#00E5FF",
          electric: "#3B82F6",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        "gradient-premium": "linear-gradient(135deg, #0A0F24 0%, #161032 50%, #091931 100%)",
        "gradient-neon": "linear-gradient(90deg, #8B5CF6 0%, #3B82F6 50%, #00E5FF 100%)",
        "gradient-card": "linear-gradient(180deg, rgba(26, 37, 75, 0.55) 0%, rgba(10, 15, 36, 0.85) 100%)",
      },
      boxShadow: {
        neon: "0 0 25px -5px rgba(139, 92, 246, 0.45), 0 0 15px -5px rgba(0, 229, 255, 0.3)",
        "neon-blue": "0 0 25px -5px rgba(0, 229, 255, 0.5)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.75", transform: "scale(1.02)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
