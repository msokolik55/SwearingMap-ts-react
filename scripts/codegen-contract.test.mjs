import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const apiProject = JSON.parse(readFileSync("apps/api/project.json", "utf8"));
const clientProject = JSON.parse(readFileSync("libs/api-client/project.json", "utf8"));
const gitignore = readFileSync(".gitignore", "utf8");
const dockerignore = readFileSync(".dockerignore", "utf8");
const attributes = readFileSync(".gitattributes", "utf8");

const generatedPaths = [
	".generated-sources.json",
	"apps/api/src/generated/prisma",
	"libs/api-client/openapi.json",
	"libs/api-client/src/generated",
];

test("defines cacheable generation targets with explicit outputs", () => {
	assert.equal(apiProject.targets.generate.cache, true);
	assert.deepEqual(apiProject.targets.generate.outputs, [
		"{projectRoot}/src/generated/prisma",
	]);

	assert.equal(clientProject.targets.openapi.cache, true);
	assert.deepEqual(clientProject.targets.openapi.outputs, [
		"{projectRoot}/openapi.json",
	]);
	assert.deepEqual(clientProject.targets.openapi.dependsOn, ["^generate"]);

	assert.equal(clientProject.targets.generate.cache, true);
	assert.deepEqual(clientProject.targets.generate.outputs, [
		"{projectRoot}/src/generated",
	]);
	assert.deepEqual(clientProject.targets.generate.dependsOn, ["openapi"]);
	assert.equal(
		packageJson.scripts.generate,
		"nx run-many -t generate --parallel=2 && node scripts/generated-sources-state.mjs write"
	);
	assert.equal(
		packageJson.scripts["api:client:generate"],
		"nx run api-client:generate"
	);
	assert.equal(packageJson.scripts["api:client:check"], undefined);
});

test("keeps generated source artifacts out of Git and Docker contexts", () => {
	for (const path of generatedPaths) {
		const escaped = path.replaceAll("/", "\\/");
		assert.match(gitignore, new RegExp(`^\\/${escaped}\\/?$`, "mu"));
		assert.match(dockerignore, new RegExp(`^${escaped}\\/?$`, "mu"));
	}

	assert.doesNotMatch(attributes, /generated|openapi\.json/u);

	const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" })
		.trim()
		.split(/\r?\n/u);
	for (const path of generatedPaths) {
		assert.equal(
			tracked.some((file) => file === path || file.startsWith(`${path}/`)),
			false,
			`${path} must not be tracked`
		);
	}
});

test("generates ignored outputs before consumers run", () => {
	for (const target of ["build", "test", "typecheck"]) {
		assert.ok(apiProject.targets[target].dependsOn.includes("generate"));
	}
	for (const target of ["test", "typecheck"]) {
		assert.ok(clientProject.targets[target].dependsOn.includes("generate"));
	}

	assert.match(packageJson.scripts.check, /^pnpm generate && /u);
});

test("guards generated-only commands with a fresh source fingerprint", () => {
	assert.equal(
		packageJson.scripts["generated:check"],
		"node scripts/generated-sources-state.mjs check"
	);
	for (const command of [
		"fallow:ci:generated",
		"fallow:full:generated",
		"check:quality:generated",
	]) {
		assert.match(packageJson.scripts[command], /^pnpm generated:check && /u);
	}
});
