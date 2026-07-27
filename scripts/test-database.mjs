import { execFileSync } from "node:child_process";

const pnpmEntrypoint = process.env.npm_execpath;
if (!pnpmEntrypoint) {
	throw new Error("Run database integration tests through pnpm.");
}

const projectName = `swearing-map-test-${process.pid}`;
const port = process.env.POSTGRES_TEST_PORT ?? "5433";
const databaseUrl =
	`postgresql://swearing_map_test:swearing_map_test@127.0.0.1:${port}` +
	"/swearing_map_test?schema=public";
const compose = [
	"compose",
	"--project-name",
	projectName,
	"--file",
	"docker/compose.yml",
	"--profile",
	"test",
];
const testEnvironment = {
	...process.env,
	DATABASE_URL: databaseUrl,
	NODE_ENV: "test",
	POSTGRES_TEST_PORT: port,
};

function run(command, args) {
	execFileSync(command, args, {
		env: testEnvironment,
		stdio: "inherit",
	});
}

function runPnpm(...args) {
	run(process.execPath, [pnpmEntrypoint, ...args]);
}

runPnpm("db:generate");

try {
	run("docker", [...compose, "up", "--detach", "--wait", "database-test"]);
	runPnpm("exec", "prisma", "migrate", "deploy");
	runPnpm("exec", "prisma", "db", "seed");
	runPnpm(
		"exec",
		"prisma",
		"migrate",
		"diff",
		"--from-schema",
		"apps/api/prisma",
		"--to-config-datasource",
		"--exit-code"
	);
	runPnpm("exec", "vitest", "run", "--config", "apps/api/vitest.integration.config.ts");
} finally {
	try {
		run("docker", [...compose, "down", "--volumes", "--remove-orphans"]);
	} catch (error) {
		console.warn("Database test cleanup failed.", error);
	}
}
