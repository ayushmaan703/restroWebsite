import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,

    allowedHosts: ["5efa-2409-40c4-17e-ebad-78d2-e9a9-835d-92e6.ngrok-free.app"],

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
