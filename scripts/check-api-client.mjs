import { spawnSync } from "node:child_process";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";

const pnpmEntrypoint = process.env.npm_execpath;
const committedRoot = resolve("libs/api-client");
const temporaryRoot = await mkdtemp(join(tmpdir(), "swearing-map-api-client-"));

async function readTree(root, directory = root) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = new Map();

	for (const entry of entries) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			for (const [name, contents] of await readTree(root, path)) {
				files.set(name, contents);
			}
		} else {
			files.set(relative(root, path).replaceAll("\\", "/"), await readFile(path));
		}
	}

	return files;
}

function assertEqualTrees(expected, actual) {
	const names = new Set([...expected.keys(), ...actual.keys()]);
	const differences = [...names].filter((name) => {
		const expectedContents = expected.get(name);
		const actualContents = actual.get(name);
		return !expectedContents?.equals(actualContents);
	});

	if (differences.length > 0) {
		console.error("Generated API contract or client is stale:");
		for (const name of differences) console.error(`- ${name}`);
		console.error("Run `pnpm api:client:generate` and commit the result.");
		process.exitCode = 1;
	}
}

try {
	if (!pnpmEntrypoint) {
		throw new Error("Run this check through pnpm.");
	}

	const result = spawnSync(process.execPath, [pnpmEntrypoint, "api:client:generate"], {
		env: { ...process.env, API_CONTRACT_ROOT: temporaryRoot },
		stdio: "inherit",
	});
	if (result.error) throw result.error;
	if (result.status !== 0) process.exit(result.status ?? 1);

	const committedGenerated = await readTree(resolve(committedRoot, "src/generated"));
	const temporaryGenerated = await readTree(resolve(temporaryRoot, "src/generated"));
	committedGenerated.set(
		"openapi.json",
		await readFile(resolve(committedRoot, "openapi.json"))
	);
	temporaryGenerated.set(
		"openapi.json",
		await readFile(resolve(temporaryRoot, "openapi.json"))
	);

	assertEqualTrees(committedGenerated, temporaryGenerated);
	if (!process.exitCode) {
		console.log("Generated API contract and client are current.");
	}
} finally {
	await rm(temporaryRoot, { force: true, recursive: true });
}
