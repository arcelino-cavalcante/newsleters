/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Critical: Helper to toggle dark mode manually
    theme: {
        extend: {},
    },
    plugins: [],
}
