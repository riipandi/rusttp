import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src-web/__tests__/**/*.test.{ts,tsx}"],
  },
});
