import type { Config } from "tailwindcss";
import sharedConfig from "@shared/tailwind-config";

const config: Pick<Config, "content" | "presets"> = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/**/*.css"], // Include CSS files in src directory
  presets: [sharedConfig],
};

export default config;
