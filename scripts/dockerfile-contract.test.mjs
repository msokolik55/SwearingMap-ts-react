import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dockerfile = readFileSync(new URL("../Dockerfile", import.meta.url), "utf8");
const dockerignore = readFileSync(new URL("../.dockerignore", import.meta.url), "utf8");
const ignoredEntries = dockerignore
	.split(/\r?\n/u)
	.map((entry) => entry.trim())
	.filter(Boolean);

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

test("copies workspace manifests before installing dependencies", () => {
	const copyMapManifest = dockerfile.indexOf(
		"COPY apps/map/package.json apps/map/package.json"
	);
	const copyWebManifest = dockerfile.indexOf(
		"COPY apps/web/package.json apps/web/package.json"
	);
	const installDependencies = dockerfile.indexOf("RUN pnpm install --frozen-lockfile");

	assert.notEqual(copyMapManifest, -1, "Map workspace manifest must be copied.");
	assert.notEqual(copyWebManifest, -1, "Web workspace manifest must be copied.");
	assert.ok(
		Math.max(copyMapManifest, copyWebManifest) < installDependencies,
		"Workspace manifests must exist before pnpm install."
	);
});

test("keeps the Husky installer in the Docker build context", () => {
	assert.equal(ignoredEntries.includes(".husky"), false);
	assert.equal(ignoredEntries.includes(".husky/install.mjs"), false);
});

test("excludes host workspace dependency links from the Linux build context", () => {
	assert.equal(ignoredEntries.includes("**/node_modules"), true);
});

test("copies the assembled Next.js shell and map into the runtime image", () => {
	assert.match(
		dockerfile,
		/COPY --from=build --chown=101:101 \/app\/dist\/site \/usr\/share\/nginx\/html/u
	);
});
