import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  root: ".",
  build: {
    outDir: "src-app/web",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": "http://localhost:3080",
      "/rpc": "http://localhost:3080",
    },
  },
});
