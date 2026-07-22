import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dockerfile = readFileSync(new URL("../Dockerfile", import.meta.url), "utf8");
const dockerignore = readFileSync(new URL("../.dockerignore", import.meta.url), "utf8");

test("copies the prepare-script entrypoint before installing dependencies", () => {
	const copyInstaller = dockerfile.indexOf(
		"COPY .husky/install.mjs .husky/install.mjs"
	);
	const installDependencies = dockerfile.indexOf("RUN pnpm install --frozen-lockfile");

	assert.notEqual(copyInstaller, -1, "Docker build must copy the prepare entrypoint.");
	assert.ok(
		copyInstaller < installDependencies,
		"Prepare entrypoint must exist before pnpm install."
	);
});

test("keeps the Husky installer in the Docker build context", () => {
	const ignoredEntries = dockerignore
		.split(/\r?\n/u)
		.map((entry) => entry.trim())
		.filter(Boolean);

	assert.equal(ignoredEntries.includes(".husky"), false);
	assert.equal(ignoredEntries.includes(".husky/install.mjs"), false);
});
