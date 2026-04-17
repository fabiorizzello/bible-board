import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    },
    // Force single React instance — fixes "Cannot read properties of null (useRef)"
    // bug when Milkdown (or other packages with React peer dep) bundles its own copy.
    dedupe: ["react", "react-dom"]
  },
  optimizeDeps: {
    // Pre-bundle Milkdown packages so they share the deduped React instance.
    include: ["@milkdown/core", "@milkdown/react", "@milkdown/preset-commonmark", "@milkdown/plugin-listener"]
  },
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()]
    }),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Bible Board",
        short_name: "Bible Board",
        description: "PWA per studio di timeline bibliche e storiche.",
        theme_color: "#0D9488",
        background_color: "#F0FDFA",
        display: "standalone",
        start_url: "/",
        icons: []
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"]
      }
    })
  ],
  test: {
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
    css: true
  }
});
