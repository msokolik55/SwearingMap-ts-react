import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/ci.yml", "utf8");

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
