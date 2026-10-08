import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// Config for the local dev page (`npm run dev` runs `vite serve dev`;
// `dev` alone would be the CLI alias for `serve`, not the folder).
// The dev page imports the library by its package name; this alias points
// that name at the TypeScript source so edits hot-reload without a build.
export default defineConfig({
  resolve: {
    alias: {
      "@gluon/gluon": fileURLToPath(
        new URL("../src/index.ts", import.meta.url),
      ),
    },
  },
  server: {
    port: 5000,
    open: true,
  },
});
