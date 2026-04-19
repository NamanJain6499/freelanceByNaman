import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Use `host: "127.0.0.1"` if `true` fails in restricted environments.
  server: { port: 5173, host: true },
});
