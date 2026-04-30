import { defineConfig } from "@lingui/cli";

export default defineConfig({
  sourceLocale: "pl",
  locales: ["en", "pl"],
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
});
