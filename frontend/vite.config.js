import { defineConfig } from 'vite'; // Importa la función 'defineConfig' de Vite. Usarla proporciona autocompletado y validación de tipos para el objeto de configuración.
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// 'plugins': Un array para los plugins de Vite. Como ya no usamos React, este array está vacío.
// Exporta por defecto el objeto de configuración que Vite utilizará.
export default defineConfig({ 
  plugins: [], 
  css: { // sección de configuración de Vite donde le decimos cómo procesar los archivos CSS.
    postcss: { 
      plugins: [
        tailwindcss, // lista de plugins que PostCSS debe usar. Vite se encargará de ejecutar esto cada vez que un archivo CSS necesite ser procesado.
        autoprefixer,
      ],
    },
  }, 
  server: { // 'server': Opciones de configuración para el servidor de desarrollo de Vite.
    host: '0.0.0.0', // 'host': Establece la dirección IP en la que el servidor debe escuchar. '0.0.0.0' lo hace accesible desde la red, crucial para Docker.
    port: 3000, // 'port': El puerto en el que se ejecutará el servidor de desarrollo.
    hmr: { // 'hmr' (Hot Module Replacement): Configuración para la recarga en caliente de módulos.
      clientPort: 8000, // 'clientPort': Especifica el puerto que el cliente (navegador) debe usar para conectarse al servidor de HMR.
    }, // Es necesario cuando se usa un proxy inverso como Nginx, para que el navegador se conecte al puerto expuesto en el host (8000).
    allowedHosts: ['frontend'], // 'allowedHosts': Una lista de hosts permitidos para evitar ataques de DNS rebinding.
  },
});
