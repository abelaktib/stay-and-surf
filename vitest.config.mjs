import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      // "server-only" refuse d'être importé hors de Next : neutralisé pour les tests
      "server-only": fileURLToPath(new URL("./tests/unit/server-only-stub.js", import.meta.url)),
    },
  },
  test: { include: ["tests/unit/**/*.test.js"], environment: "node" },
});
