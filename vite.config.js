import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,

    allowedHosts: ["614e-2409-40c4-26-6575-4185-4399-7735-80a1.ngrok-free.app"],

    proxy: {
      "/api": {
        target: "http://103.175.22.11:8911",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/STK_API_REST.asmx"),
      },
    },
  },
});
