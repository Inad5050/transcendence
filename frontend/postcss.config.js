// Exporta un objeto de configuración que le dice a PostCSS qué plugins debe ejecutar. 
// Le indica que primero procese el CSS con Tailwind (tailwindcss) y luego con Autoprefixer (autoprefixer).
module.exports = {
	plugins: {
	  tailwindcss: {},
	  autoprefixer: {},
	},
  }

