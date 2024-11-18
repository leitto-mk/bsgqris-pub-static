/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['selector', '[class*="app-dark"]'],
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    plugins: [require('tailwindcss-primeui')],
    theme: {
        screens: {
            sm: '576px',
            md: '768px',
            lg: '992px',
            xl: '1200px',
            '2xl': '1366px',
            '3xl': '1600px',
            '4xl': '1920px',
            '5xl': '2040px',
            '6xl': '2560px',
            '7xl': '3440px',
            '8xl': '3840px'
        },
        fontSize: {
            '5xs': ['0.5rem', '0.625rem'], // 8px font, 10px line-height
            '4xs': ['0.563rem', '0.75rem'], // 9px font, 12px line-height
            '3xs': ['0.625rem', '0.825rem'], // 10px font, 13px line-height
            '2xs': ['0.75rem', '1rem'], // 12px font, 16px line-height
            xs: ['0.875rem', '1.25rem'], // 14px font, 20px line-height
            sm: ['0.9375rem', '1.375rem'], // 15px font, 22px line-height
            base: ['1rem', '1.5rem'], // 16px font, 24px line-height
            lg: ['1.125rem', '1.75rem'], // 18px font, 28px line-height
            xl: ['1.25rem', '1.75rem'], // 20px font, 28px line-height
            '2xl': ['1.5rem', '2rem'], // 24px font, 32px line-height
            '3xl': ['1.875rem', '2.25rem'], // 30px font, 36px line-height
            '4xl': ['2.25rem', '2.5rem'], // 36px font, 40px line-height
            '5xl': ['3rem', '1'], // 48px font, 48px line-height (or "1" for 1:1)
            '6xl': ['3.75rem', '1'], // 60px font, 60px line-height
            '7xl': ['4.5rem', '1'], // 72px font, 72px line-height
            '8xl': ['6rem', '1'], // 96px font, 96px line-height
            '9xl': ['8rem', '1'] // 128px font, 128px line-height
        },
        extend: {
            fontFamily: {
                sans: ['Poppins', 'sans-serif'] // Use Poppins for the default 'sans' font
            }
        }
    }
};
