import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 3000,  // Frontend runs on port 3000
    strictPort: true,  // Don't try to find another port if 3000 is in use
    proxy: {
      '/api': {
        target: 'http://localhost:5000',  // Backend runs on port 5000
        changeOrigin: true,
        secure: false,
        ws: true,
        // Keep /api in the URL path when forwarding to backend
        rewrite: (path) => {
          console.log('[PROXY] Forwarding to backend:', path);
          return path;
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('[PROXY ERROR]', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log(`[PROXY] ${req.method} ${req.url} -> ${proxyReq.method} ${proxyReq.path}`);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log(`[PROXY] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
          });
        }
      }
    },
    cors: true,
    hmr: {
      clientPort: 3000
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
