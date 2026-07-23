import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { formatFallowSarifFindings, initializeFallowSarif } from "./fallow-sarif.mjs";

const pnpmEntrypoint = process.env.npm_execpath;
if (!pnpmEntrypoint) throw new Error("Run the Fallow CI reporter through pnpm.");
const base = process.env.FALLOW_AUDIT_BASE || "origin/main";
const outputPath = ".fallowci/fallow.sarif";

initializeFallowSarif(outputPath);

const result = spawnSync(
	process.execPath,
	[
		pnpmEntrypoint,
		"exec",
		"fallow",
		"audit",
		"--base",
		base,
		"--gate",
		"new-only",
		"--dead-code-baseline",
		"fallow-baselines/dead-code.json",
		"--health-baseline",
		"fallow-baselines/health.json",
		"--dupes-baseline",
		"fallow-baselines/dupes.json",
		"--threads",
		"2",
		"--format",
		"sarif",
		"--output-file",
		outputPath,
	],
	{ stdio: "inherit" }
);

if (result.error) throw result.error;
if (result.status !== 0) {
	const report = JSON.parse(readFileSync(outputPath, "utf8"));
	const findings = formatFallowSarifFindings(report);

	if (findings.length > 0) {
		console.error("\nFallow findings:");
		for (const finding of findings) console.error(`- ${finding}`);
	}

	process.exit(result.status ?? 1);
}
