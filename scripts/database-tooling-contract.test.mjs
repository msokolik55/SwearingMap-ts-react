import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const compose = readFileSync("docker/compose.yml", "utf8");
const prismaConfig = readFileSync("prisma.config.ts", "utf8");
const attributes = readFileSync(".gitattributes", "utf8");
const gitignore = readFileSync(".gitignore", "utf8");
const mainSchema = readFileSync("apps/api/prisma/schema.prisma", "utf8");
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
	assert.match(prismaConfig, /schema: "apps\/api\/prisma"/u);
	assert.match(
		prismaConfig,
		/path: "apps\/api\/prisma\/migrations"[\s\S]*?seed: "tsx apps\/api\/prisma\/seed\.ts"/u
	);
	assert.equal(packageJson.scripts["db:check"], "prisma validate && prisma generate");
	assert.match(databaseRunner, /runPnpm\("db:generate"\)/u);
	assert.match(databaseRunner, /"--from-schema",\s+"apps\/api\/prisma"/u);
});

test("organizes the Prisma schema by domain", () => {
	assert.match(mainSchema, /generator client/u);
	assert.match(mainSchema, /datasource db/u);
	assert.doesNotMatch(mainSchema, /^model /mu);

	for (const [file, model] of [
		["identity.prisma", "User"],
		["geography.prisma", "Country"],
		["vocabulary.prisma", "SwearWord"],
		["moderation.prisma", "Submission"],
		["learning.prisma", "QuizAttempt"],
		["notifications.prisma", "Notification"],
	]) {
		const schema = readFileSync(`apps/api/prisma/models/${file}`, "utf8");
		assert.match(schema, new RegExp(`^model ${model} `, "mu"));
	}
});

test("ignores generated Prisma code while keeping OpenAPI artifacts reviewable", () => {
	assert.match(gitignore, /^\/apps\/api\/src\/generated\/prisma\/$/mu);
	assert.doesNotMatch(attributes, /apps\/api\/src\/generated\/prisma/u);
	assert.match(
		attributes,
		/^libs\/api-client\/src\/generated\/\*\* linguist-generated=true$/mu
	);
});
