import json from "@eslint/json";
import markdown from "@eslint/markdown";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.js"] },
  { files: ["**/*.json"], plugins: { json }, language: "json/json" },
  { files: ["**/*.md"], plugins: { markdown }, language: "markdown/gfm" },
]);
