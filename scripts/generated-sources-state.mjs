import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { relative, resolve } from "node:path";
import { isDeepStrictEqual } from "node:util";

const workspaceRoot = process.cwd();
const statePath = resolve(workspaceRoot, ".generated-sources.json");
const inputPaths = [
	"apps/api/prisma",
	"apps/api/src",
	"apps/api/tsconfig.app.json",
	"libs/api-client/project.json",
	"openapi-ts.config.ts",
	"package.json",
	"pnpm-lock.yaml",
	"prisma.config.ts",
	"scripts/generate-openapi.ts",
	"scripts/generated-sources-state.mjs",
];
const outputPaths = [
	"apps/api/src/generated/prisma",
	"libs/api-client/openapi.json",
	"libs/api-client/src/generated",
];
const excludedInputPaths = new Set(
	outputPaths.map((path) => resolve(workspaceRoot, path))
);

function collectFiles(path, excludedPaths = new Set()) {
	const absolutePath = resolve(workspaceRoot, path);
	if (excludedPaths.has(absolutePath)) return [];
	if (!existsSync(absolutePath)) {
		throw new Error(`Required generated-source path is missing: ${path}`);
	}
	if (!statSync(absolutePath).isDirectory()) return [absolutePath];

	return readdirSync(absolutePath, { withFileTypes: true })
		.sort((left, right) => left.name.localeCompare(right.name))
		.flatMap((entry) =>
			collectFiles(resolve(absolutePath, entry.name), excludedPaths)
		);
}

function fingerprint(paths, excludedPaths = new Set()) {
	const hash = createHash("sha256");
	const files = paths
		.flatMap((path) => collectFiles(path, excludedPaths))
		.sort((left, right) => left.localeCompare(right));

	if (files.length === 0) {
		throw new Error("Generated-source fingerprint has no files.");
	}

	for (const file of files) {
		hash.update(relative(workspaceRoot, file).replaceAll("\\", "/"));
		hash.update("\0");
		hash.update(readFileSync(file));
		hash.update("\0");
	}
	return hash.digest("hex");
}

function currentState() {
	return {
		version: 1,
		inputFingerprint: fingerprint(inputPaths, excludedInputPaths),
		outputFingerprint: fingerprint(outputPaths),
	};
}

function writeState() {
	const state = currentState();
	writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
	console.log("Generated source state recorded.");
}

function assertReady() {
	if (!existsSync(statePath)) {
		throw new Error(
			"Generated source state is missing. Run `pnpm generate` before this command."
		);
	}

	const recordedState = JSON.parse(readFileSync(statePath, "utf8"));
	const state = currentState();
	if (!isDeepStrictEqual(recordedState, state)) {
		throw new Error(
			"Generated sources are missing or stale. Run `pnpm generate` before this command."
		);
	}
}

const command = process.argv[2];
if (command === "write") {
	writeState();
} else if (command === "check") {
	assertReady();
} else {
	throw new Error("Usage: generated-sources-state.mjs <write|check>");
}
