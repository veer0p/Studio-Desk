import type { Config } from 'tailwindcss';
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            screens: {
                'xs': '375px',
                'tablet': '868px',
            },
            colors: {
                sidebar: 'rgb(var(--sidebar))',
                'sidebar-foreground': 'rgb(var(--sidebar-foreground))',
                success: 'rgb(var(--success))',
                warning: 'rgb(var(--warning))',
                danger: 'rgb(var(--danger))',
                whatsapp: 'rgb(var(--whatsapp))',
                background: 'rgb(var(--background))',
                foreground: 'rgb(var(--foreground))',
                card: 'rgb(var(--card))',
                'card-foreground': 'rgb(var(--card-foreground))',
                border: 'rgb(var(--border))',
                muted: 'rgb(var(--muted))',
                'muted-foreground': 'rgb(var(--muted-foreground))',
                primary: 'rgb(var(--primary))',
                'primary-foreground': 'rgb(var(--primary-foreground))',
                input: 'rgb(var(--input))',
                ring: 'rgb(var(--ring))',
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            boxShadow: {
                card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                modal: '0 20px 60px rgba(0,0,0,0.15)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [tailwindAnimate],
};

export default config;
