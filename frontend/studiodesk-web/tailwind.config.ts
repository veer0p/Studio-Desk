import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                sidebar: 'var(--sidebar)',
                sidebarForeground: 'var(--sidebar-foreground)',
                sidebarMuted: 'var(--sidebar-muted)',
                sidebarActive: 'var(--sidebar-active)',
                primary: 'var(--primary)',
                primaryForeground: 'var(--primary-foreground)',
                success: 'var(--success)',
                warning: 'var(--warning)',
                danger: 'var(--danger)',
                whatsapp: '#25D366',
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                card: 'var(--card)',
                cardForeground: 'var(--card-foreground)',
                border: 'var(--border)',
                muted: 'var(--muted)',
                mutedForeground: 'var(--muted-foreground)',
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

export default config;
