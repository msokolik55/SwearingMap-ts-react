import { execFileSync } from "node:child_process";
import { createConnection } from "node:net";
import { setTimeout as delay } from "node:timers/promises";

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

function canConnect(host, targetPort) {
	return new Promise((resolve) => {
		const socket = createConnection({ host, port: Number(targetPort) });
		let settled = false;

		const finish = (reachable) => {
			if (settled) return;
			settled = true;
			socket.destroy();
			resolve(reachable);
		};

		socket.once("connect", () => finish(true));
		socket.once("error", () => finish(false));
		socket.setTimeout(1_000, () => finish(false));
	});
}

async function waitForTcp(host, targetPort, timeoutMs = 30_000) {
	const deadline = Date.now() + timeoutMs;

	while (Date.now() < deadline) {
		if (await canConnect(host, targetPort)) return;
		await delay(250);
	}

	throw new Error(
		`Database did not become reachable at ${host}:${targetPort} within ${timeoutMs}ms.`
	);
}

runPnpm("db:generate");

try {
	run("docker", [...compose, "up", "--detach", "--wait", "database-test"]);
	await waitForTcp("127.0.0.1", port);
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
