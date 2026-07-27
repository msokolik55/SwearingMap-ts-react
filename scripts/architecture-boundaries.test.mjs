import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const applicationRoot = "apps/api/src/app";

function sourceFiles(directory) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);

		if (entry.isDirectory()) {
			return entry.name === "generated" ? [] : sourceFiles(path);
		}

		return entry.name.endsWith(".ts") ? [path] : [];
	});
}

function normalizedSourcePath(path) {
	return relative(applicationRoot, path).replaceAll("\\", "/");
}

function mayAccessPrisma(path) {
	return (
		path.startsWith("database/") ||
		path.endsWith(".repository.ts") ||
		path.endsWith(".integration.test.ts")
	);
}

function importsPrismaDirectly(path) {
	return /(?:database\/prisma\.service|generated\/prisma\/client)/u.test(
		readFileSync(path, "utf8")
	);
}

test("keeps direct Prisma access behind repository and database boundaries", () => {
	const violations = sourceFiles(applicationRoot)
		.filter(
			(path) =>
				!mayAccessPrisma(normalizedSourcePath(path)) &&
				importsPrismaDirectly(path)
		)
		.map(normalizedSourcePath);

	assert.deepEqual(violations, []);
});

test("does not allow unsafe raw Prisma query APIs", () => {
	const violations = sourceFiles(applicationRoot)
		.filter((path) =>
			/\$(?:query|execute)RawUnsafe/u.test(readFileSync(path, "utf8"))
		)
		.map(normalizedSourcePath);

	assert.deepEqual(violations, []);
});
