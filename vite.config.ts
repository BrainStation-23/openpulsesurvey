
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
      // Add this alias to help Vite resolve the package correctly
      'use-sync-external-store/shim/with-selector': path.resolve(__dirname, 'node_modules/use-sync-external-store/shim/with-selector.js'),
    },
  },

  build: {
    sourcemap: mode !== "development", // disable sourcemap in dev to reduce memory usage
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
    define: {
      global: "globalThis", // good practice for interop with Node-ish packages
    },
  },

  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      // Ensure proper ESM/CJS interop for these packages
      plugins: [
        {
          name: 'fix-cjs-imports',
          setup(build) {
            build.onResolve({ filter: /^use-sync-external-store/ }, (args) => {
              return { path: args.path, namespace: 'use-sync-external-store' };
            });
          },
        },
      ],
    },
    // Add zustand to the exclude list to prevent pre-optimization
    exclude: [
      "@tanstack/react-query",
      "framer-motion",
      "@xyflow/react",
      "zustand",
      "use-sync-external-store",
    ],
  },
}));
