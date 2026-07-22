import { appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

import { createCiPlan } from "./changed-verification.mjs";

function git(...args) {
	return spawnSync("git", args, { encoding: "utf8" });
}

function writeOutput(name, value) {
	const output = process.env.GITHUB_OUTPUT;
	if (!output) throw new Error("GITHUB_OUTPUT is required in CI.");
	appendFileSync(output, `${name}=${String(value)}\n`);
}

function fullPlan() {
	return {
		full: true,
		dependencies: true,
		browser: true,
		lighthouse: true,
		container: true,
	};
}

const pullRequest = process.env.GITHUB_EVENT_NAME === "pull_request";
const baseRef = pullRequest ? `origin/${process.env.GITHUB_BASE_REF}` : "HEAD^";
let plan = fullPlan();
let mergeBase = baseRef;

if (pullRequest) {
	const mergeBaseResult = git("merge-base", "HEAD", baseRef);
	mergeBase = mergeBaseResult.stdout.trim();
	const diff =
		mergeBase &&
		git("diff", "--name-only", "--diff-filter=ACMRD", `${mergeBase}...HEAD`);
	if (diff?.status === 0) {
		const paths = diff.stdout.split(/\r?\n/u).filter(Boolean);
		plan = createCiPlan(paths);
		writeOutput("changed_count", paths.length);
	}
}

writeOutput("base", mergeBase || baseRef);
for (const [name, value] of Object.entries(plan)) writeOutput(name, value);

console.log(`CI plan: ${JSON.stringify({ base: mergeBase || baseRef, ...plan })}`);
