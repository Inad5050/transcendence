/** @type {import('tailwindcss').Config} */ // Es un comentario especial que habilita el autocompletado y la comprobación de tipos para la configuración de Tailwind en editores de código compatibles.

export default {
	content: [ // 'content': es la configuración más importante para la optimización. Le dice a Tailwind qué archivos debe escanear para encontrar las clases de utilidad que se están usando.
	  "./index.html", // Escanea el archivo HTML principal.
	  "./src/**/*.{js,ts,jsx,tsx}", // Escanea todos los archivos con estas extensiones dentro del directorio 'src' y sus subdirectorios.
	],
	theme: { // 'theme': es donde se personaliza el sistema de diseño de Tailwind. Se pueden extender o sobrescribir colores, espaciados, fuentes, etc.
	  extend: {}, // 'extend': Permite añadir nuevos valores al tema por defecto sin sobrescribirlo por completo.
	},
	plugins: [], // 'plugins': Permite añadir plugins de Tailwind para extender su funcionalidad, como plugins para tipografía o formularios.
  }
  