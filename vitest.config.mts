import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/mail/**/*.test.ts"],
    testTimeout: 10_000,
    hookTimeout: 10_000,
    restoreMocks: true,
  },
});
