import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class", // now just "class" or "media"
    content: [
        "./app/**/*.{ts,tsx,js,jsx}",
        "./pages/**/*.{ts,tsx,js,jsx}",
        "./components/**/*.{ts,tsx,js,jsx}",
        "./src/**/*.{ts,tsx,js,jsx}",
        "./**/*.{js,ts,jsx,tsx,mdx}",
    ],
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
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Custom color palette (converted from HEX to HSL)
                teal: {
                    DEFAULT: "hsl(173 54% 39%)",   // #2A9D8F
                    dark: "hsl(173 60% 30%)",      // #218377
                    light: "hsl(173 43% 46%)",     // #3CAFA1
                },
                navy: {
                    DEFAULT: "hsl(197 30% 24%)",   // #264653
                    dark: "hsl(197 39% 18%)",      // #1E3A45
                    light: "hsl(197 35% 31%)",     // #325A6C
                },
                orange: {
                    DEFAULT: "hsl(29 89% 67%)",    // #F4A261
                    dark: "hsl(29 89% 60%)",       // #F28C3C
                    light: "hsl(29 88% 73%)",      // #F6B483
                },
                coral: {
                    DEFAULT: "hsl(12 68% 61%)",    // #E76F51
                    dark: "hsl(12 74% 56%)",       // #E35A38
                    light: "hsl(12 75% 67%)",      // #EB8A71
                },

            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
