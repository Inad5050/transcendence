import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [], // Array de plugins vacío
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      clientPort: 8000,
    },
    allowedHosts: ['frontend'],
  },
});
