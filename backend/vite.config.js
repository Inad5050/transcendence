import { defineConfig } from 'vite';

export default defineConfig({
  // ... other configuration (plugins, etc.)

  preview: {
    // This allows access from the host 'backend' which Nginx uses
    // and is necessary because your Nginx is acting as a proxy.
    allowedHosts: ['backend'],
  },
});
