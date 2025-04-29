import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [".lovableproject.com"],
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    sourcemap: mode !== "development", // disables sourcemap in dev
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          query: ["@tanstack/react-query"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          charts: ["recharts"],
          flow: ["@xyflow/react"],
        },
      },
    },
    chunkSizeWarningLimit: 2000,
    minify: "esbuild",
  },

  optimizeDeps: {
    exclude: [
      "@tanstack/react-query",
      "framer-motion",
      "@xyflow/react"
    ],
  },
}));
