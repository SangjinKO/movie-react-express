import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build path differs between the staged preview rollout (e.g. /movie-preview/)
// and the eventual /my_flix/ cutover — Vite bakes `base` into asset URLs at
// build time, so it must be chosen per-build, not switched at runtime.
// `npm run build` defaults to /my_flix/; override with:
//   VITE_BASE_PATH=/movie-preview/ npm run build
const basePath = process.env.VITE_BASE_PATH ?? "/my_flix/";

export default defineConfig({
  plugins: [react()],
  base: basePath,
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
