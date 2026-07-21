const { chromium } = require("@playwright/test");

module.exports = {
	ci: {
		collect: {
			chromePath: chromium.executablePath(),
			isSinglePageApplication: true,
			numberOfRuns: 3,
			puppeteerScript: "./scripts/lighthouse-setup.cjs",
			puppeteerLaunchOptions: process.env.CI
				? { args: ["--no-sandbox", "--disable-setuid-sandbox"] }
				: undefined,
			staticDistDir: "./dist",
			url: ["http://localhost/"],
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
