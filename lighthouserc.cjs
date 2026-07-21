const { chromium } = require("@playwright/test");

module.exports = {
	ci: {
		collect: {
			chromePath: chromium.executablePath(),
			numberOfRuns: 3,
			puppeteerScript: "./scripts/lighthouse-setup.cjs",
			startServerCommand: "pnpm preview --host 127.0.0.1 --port 4173",
			startServerReadyPattern: "Local:",
			startServerReadyTimeout: 120_000,
			url: ["http://127.0.0.1:4173/"],
			settings: {
				preset: "desktop",
				blockedUrlPatterns: ["*://*.tile.openstreetmap.org/*"],
			},
		},
		assert: {
			assertions: {
				"categories:performance": ["error", { minScore: 0.8 }],
				"categories:accessibility": ["error", { minScore: 0.9 }],
				"categories:best-practices": ["error", { minScore: 0.9 }],
				"categories:seo": ["error", { minScore: 0.9 }],
				"cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
			},
		},
		upload: {
			target: "filesystem",
			outputDir: ".lighthouseci",
		},
	},
};
