import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://dkd4pk-24678.sse.codesandbox.io/
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      port: process.env.APP_PORT || 5000,
      clientPort: 5000,
      path: "/vite-hmr",
    },
  },
});
