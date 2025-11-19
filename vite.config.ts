import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // IMPORTANT: Vite proxy matches paths in the order they are defined
      // More specific paths MUST come before general paths
      // Use bypass function to exclude /api/chat from general /api proxy
      
      // Chat API proxy - handle /api/chat requests
      "/api/chat": {
        target: "http://178.18.248.134:8111",
        changeOrigin: true,
        secure: false,
        // Rewrite: ensure trailing slash for target server
        rewrite: (path) => {
          // /api/chat -> /api/chat/
          // /api/chat/ -> /api/chat/
          return path.endsWith('/') ? path : path + '/';
        },
        configure: (proxy) => {
          proxy.on("error", (err, _req, _res) => {
            console.error("❌ Chat API proxy error:", err.message);
          });
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("✅ Chat API proxy MATCHED:", req.method, req.url);
            console.log("🎯 Proxying to:", `http://178.18.248.134:8111${proxyReq.path}`);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log("📥 Chat API response:", proxyRes.statusCode, req.url);
          });
        },
      },
      // General API proxy - must come AFTER /api/chat
      // Vite will match /api/chat first, so /api won't match /api/chat
      "/api": {
        target: "https://koznuri.novacode.uz",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
        configure: (proxy) => {
          proxy.on("proxyReq", (_proxyReq, req) => {
            // Log requests (should not see /api/chat here)
            if (req.url && !req.url.includes('/api/chat')) {
              console.log("📡 General API proxy:", req.method, req.url);
            } else if (req.url && req.url.includes('/api/chat')) {
              console.error("⚠️ ERROR: /api/chat matched /api proxy! This should not happen!");
            }
          });
        },
      },
    },
  },
});
