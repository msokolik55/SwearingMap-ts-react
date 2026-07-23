import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { initializeFallowSarif } from "./fallow-sarif.mjs";

test("initializes a valid empty SARIF report for clean Fallow audits", () => {
	const directory = mkdtempSync(join(tmpdir(), "fallow-sarif-"));
	const outputPath = join(directory, "fallow.sarif");

	initializeFallowSarif(outputPath);

	const report = JSON.parse(readFileSync(outputPath, "utf8"));
	assert.equal(report.version, "2.1.0");
	assert.equal(report.$schema, "https://json.schemastore.org/sarif-2.1.0.json");
	assert.deepEqual(report.runs[0].results, []);
	assert.equal(report.runs[0].tool.driver.name, "Fallow");
});
