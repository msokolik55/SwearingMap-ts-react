import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const changesJob = workflow.match(
	/^ {2}changes:\r?\n(?<body>[\s\S]*?)(?=^ {2}quality:)/mu
)?.groups?.body;

test("exposes the CI change planner as a package entry point", () => {
	assert.equal(
		packageJson.scripts["ci:change-plan"],
		"node scripts/ci-change-plan.mjs"
	);
	assert.ok(changesJob, "changes job must exist");

	const pnpmSetup = changesJob.indexOf("uses: pnpm/action-setup@v6");
	const nodeSetup = changesJob.indexOf("uses: actions/setup-node@v7");
	const changePlan = changesJob.indexOf("run: pnpm ci:change-plan");

	assert.ok(pnpmSetup >= 0, "changes job must install pnpm");
	assert.ok(nodeSetup > pnpmSetup, "changes job must configure Node.js after pnpm");
	assert.ok(changePlan > nodeSetup, "toolchain must be ready before the change plan");
});

test("runs the pull-request Fallow audit after an earlier independent gate fails", () => {
	assert.match(
		workflow,
		/- name: Audit changed code with Fallow\s+if: always\(\) && github\.event_name == 'pull_request'/u
	);
});

test("restores Nx cache and generates source artifacts before quality checks", () => {
	const qualityJob = workflow.match(
		/^ {2}quality:\r?\n(?<body>[\s\S]*?)(?=^ {2}browser:)/mu
	)?.groups?.body;

	assert.ok(qualityJob, "quality job must exist");
	const cache = qualityJob.indexOf("uses: actions/cache@v5");
	const install = qualityJob.indexOf("run: pnpm install --frozen-lockfile");
	const generate = qualityJob.indexOf("run: pnpm generate");
	const fallow = qualityJob.indexOf("run: pnpm fallow:ci");

	assert.ok(cache >= 0, "quality job must restore the Nx task cache");
	assert.ok(install > cache, "dependencies must be installed after cache restore");
	assert.ok(generate > install, "source generation must run after installation");
	assert.ok(fallow > generate, "Fallow must run after source generation");
	assert.match(qualityJob, /path: \.nx\/cache/u);
});

test("always uploads the pull-request SARIF artifact and requires it to exist", () => {
	assert.match(
		workflow,
		/- name: Upload Fallow SARIF report\s+if: always\(\) && github\.event_name == 'pull_request'[\s\S]*?path: \.fallowci\/fallow\.sarif[\s\S]*?if-no-files-found: error/u
	);
});

test("runs isolated database migrations and integration tests when selected", () => {
	assert.match(
		workflow,
		/database:\s+name: Database integration[\s\S]*?if: needs\.changes\.outputs\.database == 'true'[\s\S]*?run: pnpm test:database/u
	);
});
