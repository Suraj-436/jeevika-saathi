import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Unique instance ID generated anew whenever the Vite development server is started (npm run dev)
const DEV_SERVER_INSTANCE_ID = `sih_server_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export default defineConfig({
  define: {
    __DEV_SERVER_INSTANCE_ID__: JSON.stringify(DEV_SERVER_INSTANCE_ID),
  },
  plugins: [
    react(),
    {
      name: 'dev-server-instance-endpoint',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/__dev_session_id')) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
            res.end(JSON.stringify({ instanceId: DEV_SERVER_INSTANCE_ID }));
            return;
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy all /api/* requests to the Express backend server
      // This keeps OPENROUTER_API_KEY completely server-side
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
