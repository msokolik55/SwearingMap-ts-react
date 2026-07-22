import { mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const pnpmEntrypoint = process.env.npm_execpath;
if (!pnpmEntrypoint) throw new Error("Run the Fallow CI reporter through pnpm.");
const base = process.env.FALLOW_AUDIT_BASE || "origin/main";

mkdirSync(".fallowci", { recursive: true });

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
		"--threads",
		"2",
		"--format",
		"sarif",
		"--output-file",
		".fallowci/fallow.sarif",
	],
	{ stdio: "inherit" }
);

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
