import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// https://dkd4pk-24678.sse.codesandbox.io/
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      port: parseInt(process.env.PORT) || 5000,
      clientPort: parseInt(process.env.PORT) || 5000,
      path: "/vite-hmr",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
