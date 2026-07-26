import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const compose = readFileSync("docker/compose.yml", "utf8");
const prismaConfig = readFileSync("prisma.config.ts", "utf8");
const attributes = readFileSync(".gitattributes", "utf8");
const databaseRunner = readFileSync("scripts/test-database.mjs", "utf8");

test("provides explicit development and isolated test database commands", () => {
	assert.equal(
		packageJson.scripts["db:up"],
		"docker compose --file docker/compose.yml up --detach --wait database"
	);
	assert.equal(packageJson.scripts["test:database"], "node scripts/test-database.mjs");
	assert.match(compose, /database-test:[\s\S]*?profiles: \["test"\]/u);
	assert.match(compose, /database-test:[\s\S]*?tmpfs:/u);
	assert.match(databaseRunner, /swearing-map-test-\$\{process\.pid\}/u);
	assert.match(databaseRunner, /finally \{/u);
});

test("configures deterministic Prisma migrations and seed execution", () => {
	assert.match(prismaConfig, /schema: "apps\/api\/prisma\/schema\.prisma"/u);
	assert.match(
		prismaConfig,
		/path: "apps\/api\/prisma\/migrations"[\s\S]*?seed: "tsx apps\/api\/prisma\/seed\.ts"/u
	);
});

test("marks committed generated clients as generated source", () => {
	assert.match(
		attributes,
		/^apps\/api\/src\/generated\/prisma\/\*\* linguist-generated=true whitespace=-trailing-space$/mu
	);
	assert.match(
		attributes,
		/^libs\/api-client\/src\/generated\/\*\* linguist-generated=true$/mu
	);
});
