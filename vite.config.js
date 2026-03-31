import { resolve } from "path";
import { defineConfig } from "vite";
import purgecss from "@fullhuman/postcss-purgecss";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      purgecss({
        content: ["./index.html", "./src/**/*.js"],
        safelist: {
          standard: [/^nav-/, /^btn-/, /^modal-/],
          deep: [/data-bs-theme$/],
        },
      }),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          navigateFallback: undefined,
          runtimeCaching: [],
          globPatterns: [],
        },
        manifest: {
          name: "Sasalele Music Station",
          short_name: "SMS",
          description: "Your personal music and media hub.",
          theme_color: "#000000",
          background_color: "#000000",
          display: "standalone",
          orientation: "any",
          start_url: "/",
          scope: "/",
          icons: [
            {
              src: "/assets/sasalele_logo.webp",
              sizes: "192x192",
              type: "image/webp",
              purpose: "any",
            },
            {
              src: "/assets/sasalele_logo.png",
              sizes: "180x180",
              type: "image/png",
            },
          ],
          shortcuts: [
            {
              name: "Open Website List",
              short_name: "Website",
              url: "/website",
              icons: [{ src: "/assets/sasalele_logo.webp", sizes: "192x192" }],
            },
            {
              name: "Open Drive",
              short_name: "Drive",
              url: "/drive",
              icons: [{ src: "/assets/sasalele_logo.webp", sizes: "192x192" }],
            },
            {
              name: "Watch Video",
              short_name: "Video",
              url: "/video",
              icons: [{ src: "/assets/sasalele_logo.webp", sizes: "192x192" }],
            },
          ],
        },
      }),
    ].filter(Boolean),
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
          website: resolve(__dirname, "website.html"),
          video: resolve(__dirname, "video.html"),
          drive: resolve(__dirname, "drive.html"),
          privacypolicy: resolve(__dirname, "privacy-policy.html"),
          tos: resolve(__dirname, "terms-of-service.html"),
        },
      },
    },
  };
});
