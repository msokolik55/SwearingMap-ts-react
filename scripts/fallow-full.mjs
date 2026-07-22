import { spawnSync } from "node:child_process";

const pnpmEntrypoint = process.env.npm_execpath;
if (!pnpmEntrypoint) throw new Error("Run the full Fallow audit through pnpm.");

const analyses = [
	["dead-code", "fallow-baselines/dead-code.json"],
	["health", "fallow-baselines/health.json"],
	["dupes", "fallow-baselines/dupes.json"],
];

for (const [analysis, baseline] of analyses) {
	const result = spawnSync(
		process.execPath,
		[
			pnpmEntrypoint,
			"exec",
			"fallow",
			analysis,
			"--production",
			"--baseline",
			baseline,
			"--fail-on-issues",
			"--threads",
			"2",
		],
		{ stdio: "inherit" }
	);

	if (result.error) throw result.error;
	if (result.status !== 0) process.exit(result.status ?? 1);
}
