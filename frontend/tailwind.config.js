/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                nature: {
                    50: '#f2fbdf',
                    500: '#84cc16',
                    900: '#365314',
                }
            }
        },
    },
    plugins: [],
}
