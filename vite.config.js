import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  // relative asset paths so the build works under the
  // /vectra-site/ project URL on GitHub Pages (and anywhere else)
  base: "./",
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        logoLab: resolve(import.meta.dirname, "logo-lab.html"),
      },
    },
  },
});
