import { resolve } from "path";
import { defineConfig } from "vite";
import { ViteMinifyPlugin } from "vite-plugin-minify";

export default defineConfig({
  plugins: [ViteMinifyPlugin({})],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        website: resolve(__dirname, "website.html"),
        video: resolve(__dirname, "video.html"),
        drive: resolve(__dirname, "drive.html"),
        hirakataroma: resolve(__dirname, "hirakataroma.html"),
        privacypolicy: resolve(__dirname, "privacypolicy.html"),
      },
    },
  },
});
