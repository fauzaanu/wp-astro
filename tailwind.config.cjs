/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            backgroundImage: {
                'glow-gradient': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
            },
            colors: {
                glow: {
                    start: '#a855f7', // purple-500
                    middle: '#581c87', // purple-900
                    end: '#09090b', // zinc-950
                },
            },
        },
    },
    plugins: [require('daisyui')],
    daisyui: {
        themes: [
            {
                mytheme: {
                    primary: '#d94948',
                    secondary: '#4959ed',
                    accent: '#38077c',
                    neutral: '#1F2228',
                    'base-100': '#0e1113',
                    info: '#5eead4',
                    success: '#126E52',
                    warning: '#C49B08',
                    error: '#FA1E29',
                },
            },
        ],
    },
};
