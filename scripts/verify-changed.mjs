import { spawnSync } from "node:child_process";

import {
	classifyChanges,
	parseNameStatus,
	requiresFullVerification,
} from "./changed-verification.mjs";

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function spawn(command, args, stdio) {
	const result = spawnSync(command, args, {
		encoding: "utf8",
		stdio,
	});
	if (result.error) throw result.error;
	return result;
}

function run(command, args) {
	const result = spawn(command, args, "inherit");
	if (result.status !== 0) process.exit(result.status ?? 1);
	return result;
}

function git(args) {
	return spawn("git", args, ["ignore", "pipe", "pipe"]);
}

function resolveMergeBase() {
	const configuredBase = process.env.VERIFY_BASE || "origin/main";
	const result = git(["merge-base", "HEAD", configuredBase]);
	if (result.status !== 0) return undefined;
	return result.stdout.trim() || undefined;
}

function readChangedFiles(mergeBase) {
	const result = git([
		"diff",
		"--name-status",
		"--find-renames",
		"--diff-filter=ACMRD",
		"-z",
		`${mergeBase}...HEAD`,
	]);

	if (result.status !== 0) return undefined;

	return parseNameStatus(result.stdout);
}

function runPnpm(...args) {
	run(pnpm, args);
}

const mergeBase = resolveMergeBase();
if (!mergeBase) {
	console.warn("Unable to determine a safe merge base; running full verification.");
	runPnpm("check");
	process.exit(0);
}

const files = readChangedFiles(mergeBase);
if (!files) {
	console.warn("Unable to determine changed files; running full verification.");
	runPnpm("check");
	process.exit(0);
}

if (files.length === 0) {
	console.log("No committed changes to verify.");
	process.exit(0);
}

console.log(`Verifying ${files.length} changed file(s) since ${mergeBase}.`);
runPnpm(
	"exec",
	"fallow",
	"audit",
	"--base",
	mergeBase,
	"--gate",
	"new-only",
	"--threads",
	"2"
);

const paths = files.map((file) => file.path);
if (requiresFullVerification(paths)) {
	console.log(
		"Shared tooling or configuration changed; escalating to full verification."
	);
	runPnpm("check");
	process.exit(0);
}

const changes = classifyChanges(files);
if (changes.formatPaths.length) {
	runPnpm("exec", "prettier", "--check", ...changes.formatPaths);
}
if (changes.codePaths.length) {
	runPnpm("exec", "eslint", "--max-warnings=0", ...changes.codePaths);
	runPnpm("exec", "vitest", "related", "--run", ...changes.codePaths);
}
if (changes.typeScriptChanged) runPnpm("typecheck");
if (changes.appChanged) {
	runPnpm("build");
	runPnpm("test:e2e:ci");
}
if (changes.containerChanged) {
	runPnpm("container:build");
	runPnpm("container:smoke");
}

console.log("Changed-file verification passed.");
