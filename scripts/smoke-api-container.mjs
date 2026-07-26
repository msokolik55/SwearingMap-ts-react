import { assert, assertNonRootImage, docker } from "./container-smoke.mjs";

const image = process.env.API_CONTAINER_IMAGE ?? "swearing-map-api:local";
const name = `swearing-map-api-smoke-${process.pid}`;
const port = process.env.API_CONTAINER_SMOKE_PORT ?? "13000";
const baseUrl = `http://127.0.0.1:${port}`;

async function waitUntilReady() {
	for (let attempt = 1; attempt <= 30; attempt += 1) {
		try {
			const response = await fetch(`${baseUrl}/api/v1/health`);
			if (response.ok) return response;
		} catch {
			// The container may still be starting.
		}

		await new Promise((resolve) => setTimeout(resolve, 500));
	}

	throw new Error("API container did not become healthy within 15 seconds.");
}

assertNonRootImage(image, "Production API image");

const started = docker(
	"run",
	"--detach",
	"--rm",
	"--name",
	name,
	"--publish",
	`127.0.0.1:${port}:3000`,
	image
);
assert(started.status === 0, `Unable to start container:\n${started.stderr.trim()}`);

try {
	const health = await waitUntilReady();
	assert(
		JSON.stringify(await health.json()) ===
			JSON.stringify({
				service: "swearing-map-api",
				status: "ok",
				version: "1.0.0",
			}),
		"API health response does not match its contract."
	);

	const openApi = await fetch(`${baseUrl}/api/openapi.json`);
	assert(openApi.ok, `OpenAPI endpoint returned HTTP ${openApi.status}.`);
	assert(
		Object.hasOwn((await openApi.json()).paths, "/api/v1/health"),
		"OpenAPI contract does not contain the health endpoint."
	);

	console.log(`API container smoke test passed at ${baseUrl}.`);
} finally {
	docker("rm", "--force", name);
}
