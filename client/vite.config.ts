
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],

    define: {
      "import.meta.env.GOOGLE_CLIENT_ID": JSON.stringify(
        env.GOOGLE_CLIENT_ID
      ),
    },

    server: {
      proxy: {
        "/api": {
          target: "https://collage-erp-hnx0.onrender.com",
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
