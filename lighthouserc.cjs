const { chromium } = require("@playwright/test");

const numberOfRuns = Number(process.env.LIGHTHOUSE_RUNS ?? 3);
if (!Number.isInteger(numberOfRuns) || numberOfRuns < 1) {
	throw new Error("LIGHTHOUSE_RUNS must be a positive integer.");
}

module.exports = {
	ci: {
		collect: {
			chromePath: chromium.executablePath(),
			isSinglePageApplication: false,
			numberOfRuns,
			puppeteerScript: "./scripts/lighthouse-setup.cjs",
			puppeteerLaunchOptions: process.env.CI
				? { args: ["--no-sandbox", "--disable-setuid-sandbox"] }
				: undefined,
			staticDistDir: "./dist/site",
			url: ["http://localhost/", "http://localhost/map/"],
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
