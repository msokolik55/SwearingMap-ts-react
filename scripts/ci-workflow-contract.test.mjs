import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

test("exposes the CI change planner as a package entry point", () => {
	assert.equal(
		packageJson.scripts["ci:change-plan"],
		"node scripts/ci-change-plan.mjs"
	);
	assert.match(
		workflow,
		/- name: Select affected checks[\s\S]*?run: pnpm ci:change-plan/u
	);
});

test("runs the pull-request Fallow audit after an earlier independent gate fails", () => {
	assert.match(
		workflow,
		/- name: Audit changed code with Fallow\s+if: always\(\) && github\.event_name == 'pull_request'/u
	);
});

test("always uploads the pull-request SARIF artifact and requires it to exist", () => {
	assert.match(
		workflow,
		/- name: Upload Fallow SARIF report\s+if: always\(\) && github\.event_name == 'pull_request'[\s\S]*?path: \.fallowci\/fallow\.sarif[\s\S]*?if-no-files-found: error/u
	);
});
