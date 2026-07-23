import assert from "node:assert/strict";
import test from "node:test";

import {
	classifyChanges,
	createAffectedTargets,
	createCiPlan,
	parseNameStatus,
	requiresFullVerification,
} from "./changed-verification.mjs";

test("shared configuration changes require full verification", () => {
	assert.equal(requiresFullVerification(["package.json"]), true);
	assert.equal(requiresFullVerification(["nx.json"]), true);
	assert.equal(requiresFullVerification(["scripts/ci-change-plan.mjs"]), true);
	assert.equal(requiresFullVerification(["fallow-baselines/health.json"]), true);
	assert.equal(requiresFullVerification(["src/App.tsx"]), false);
});

test("classifies app, code, and deleted files without checking deleted paths", () => {
	const result = classifyChanges([
		{ path: "apps/map/src/App.tsx", deleted: false },
		{ path: "docs/old.md", deleted: true },
	]);

	assert.deepEqual(result.codePaths, ["apps/map/src/App.tsx"]);
	assert.deepEqual(result.formatPaths, ["apps/map/src/App.tsx"]);
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

test("selects only relevant expensive CI suites", () => {
	assert.deepEqual(createCiPlan(["docs/roadmap.md"]), {
		full: false,
		dependencies: false,
		browser: false,
		lighthouse: false,
		container: false,
	});
	assert.equal(createCiPlan(["apps/map/src/App.tsx"]).browser, true);
	assert.equal(createCiPlan(["apps/map/src/App.tsx"]).lighthouse, true);
	assert.equal(createCiPlan(["apps/web/app/page.tsx"]).browser, true);
	assert.equal(createCiPlan(["apps/web/app/page.tsx"]).lighthouse, true);
	assert.equal(createCiPlan(["docker/nginx.conf"]).container, true);
	assert.equal(createCiPlan(["scripts/assemble-site.mjs"]).container, true);
});

test("shared CI configuration forces every suite", () => {
	assert.deepEqual(createCiPlan([".github/workflows/ci.yml"]), {
		full: true,
		dependencies: true,
		browser: true,
		lighthouse: true,
		container: true,
	});
	assert.deepEqual(createCiPlan(["docs/roadmap.md"], true), {
		full: true,
		dependencies: true,
		browser: true,
		lighthouse: true,
		container: true,
	});
});

test("keeps affected project work bounded by verification mode", () => {
	assert.deepEqual(createAffectedTargets(), ["lint", "typecheck", "test", "build"]);
	assert.deepEqual(createAffectedTargets(true), ["lint", "typecheck", "test"]);
});
