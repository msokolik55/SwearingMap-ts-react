import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["src/**/*.test.{ts,tsx}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "lcov"],
		},
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
	},
});
