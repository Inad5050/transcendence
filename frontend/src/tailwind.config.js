// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Tailwind buscará clases en todos los archivos TSX y TS de la carpeta src
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        // Mantenemos el color cian para simular el azul de React/ft_transcender
        'cyan': {
          400: '#61dafb', 
        }
      }
    },
  },
  plugins: [],
}
