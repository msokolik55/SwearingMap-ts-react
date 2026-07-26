import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		include: ["apps/api/src/**/*.integration.test.ts"],
		fileParallelism: false,
		testTimeout: 15_000,
	},
});
