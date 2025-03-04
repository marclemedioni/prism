import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "coverage/",
        "**/*.d.ts",
        "**/*.config.{js,ts}",
        "**/types.ts",
      ],
    },
    include: ["**/*.test.{js,jsx,ts,tsx}"],
    exclude: ["node_modules", ".next", "coverage"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./app"),
      "~encore": resolve(__dirname, "./encore.gen"),
    },
  },
});
