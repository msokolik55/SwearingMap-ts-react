import assert from "node:assert/strict";
import test from "node:test";

import {
	classifyChanges,
	parseNameStatus,
	requiresFullVerification,
} from "./changed-verification.mjs";

test("shared configuration changes require full verification", () => {
	assert.equal(requiresFullVerification(["package.json"]), true);
	assert.equal(requiresFullVerification(["src/App.tsx"]), false);
});

test("classifies app, code, and deleted files without checking deleted paths", () => {
	const result = classifyChanges([
		{ path: "src/App.tsx", deleted: false },
		{ path: "docs/old.md", deleted: true },
	]);

	assert.deepEqual(result.codePaths, ["src/App.tsx"]);
	assert.deepEqual(result.formatPaths, ["src/App.tsx"]);
	assert.equal(result.typeScriptChanged, true);
	assert.equal(result.appChanged, true);
});

test("selects container checks independently", () => {
	const result = classifyChanges([{ path: "docker/nginx.conf", deleted: false }]);

	assert.equal(result.containerChanged, true);
	assert.equal(result.appChanged, false);
});

test("uses the destination of renamed files", () => {
	const result = parseNameStatus("R100\0old-name.ts\0new-name.ts\0", () => true);

	assert.equal(result.length, 1);
	assert.equal(result[0].path, "new-name.ts");
});
