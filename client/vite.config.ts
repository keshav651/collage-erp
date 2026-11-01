
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(),

      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.png"],

        manifest: {
          id: "/",
          name: "MSME College ERP",
          short_name: "MSME ERP",
          description: "College ERP Portal for Admin and Teachers",
          start_url: "/",
          scope: "/",
          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#800000",

          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },

        devOptions: {
          enabled: true,
        },
      }),
    ],

    define: {
      "import.meta.env.GOOGLE_CLIENT_ID": JSON.stringify(
        env.GOOGLE_CLIENT_ID
      ),
    },

    server: {
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
