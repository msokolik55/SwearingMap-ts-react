import { spawnSync } from "node:child_process";

const image = process.env.CONTAINER_IMAGE ?? "swearing-map:local";
const name = `swearing-map-smoke-${process.pid}`;
const port = process.env.CONTAINER_SMOKE_PORT ?? "18080";
const baseUrl = `http://127.0.0.1:${port}`;

function docker(...args) {
	return spawnSync("docker", args, {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
}

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

async function waitUntilReady() {
	for (let attempt = 1; attempt <= 30; attempt += 1) {
		try {
			const response = await fetch(`${baseUrl}/healthz`);
			if (response.ok && (await response.text()).trim() === "ok") return;
		} catch {
			// The container may still be starting.
		}

		await new Promise((resolve) => setTimeout(resolve, 500));
	}

	throw new Error("Container did not become healthy within 15 seconds.");
}

const imageUser = docker("image", "inspect", "--format", "{{.Config.User}}", image);
assert(imageUser.status === 0, `Unable to inspect image:\n${imageUser.stderr.trim()}`);
assert(
	!["", "0", "root"].includes(imageUser.stdout.trim()),
	"Production image must declare a non-root user."
);

const started = docker(
	"run",
	"--detach",
	"--rm",
	"--name",
	name,
	"--publish",
	`127.0.0.1:${port}:8080`,
	image
);

if (started.status !== 0) {
	throw new Error(`Unable to start container:\n${started.stderr.trim()}`);
}

try {
	await waitUntilReady();

	const page = await fetch(`${baseUrl}/`);
	const html = await page.text();
	assert(page.ok, `Application returned HTTP ${page.status}.`);
	assert(
		page.headers.get("content-security-policy")?.includes("default-src 'self'"),
		"Content-Security-Policy header is missing."
	);
	assert(
		page.headers.get("x-content-type-options") === "nosniff",
		"X-Content-Type-Options header is missing."
	);
	assert(page.headers.get("cache-control") === "no-cache", "HTML must not be cached.");
	assert(
		html.includes("Learn the language people use"),
		"Product shell was not served at the root route."
	);

	const mapPage = await fetch(`${baseUrl}/map/`);
	const mapHtml = await mapPage.text();
	assert(mapPage.ok, `Map route returned HTTP ${mapPage.status}.`);
	assert(
		mapHtml.includes('<div id="root"></div>'),
		"Map route did not serve the Vite app."
	);

	const deepLink = await fetch(`${baseUrl}/map/countries/slovakia`);
	assert(deepLink.ok, `SPA deep link returned HTTP ${deepLink.status}.`);
	assert(
		(await deepLink.text()).includes('<div id="root"></div>'),
		"SPA deep link did not fall back to index.html."
	);

	const assetPath = mapHtml.match(/(?:src|href)="(\/map\/assets\/[^"]+)"/)?.[1];
	assert(assetPath, "Built asset URL was not found in index.html.");

	const asset = await fetch(`${baseUrl}${assetPath}`, { method: "HEAD" });
	assert(asset.ok, `Built asset returned HTTP ${asset.status}.`);
	assert(
		asset.headers.get("cache-control")?.includes("immutable"),
		"Fingerprint asset does not use immutable caching."
	);

	const data = await fetch(`${baseUrl}/map/data/borders.json`, { method: "HEAD" });
	assert(data.ok, `GeoJSON data returned HTTP ${data.status}.`);
	assert(
		data.headers.get("cache-control")?.includes("stale-while-revalidate"),
		"GeoJSON cache policy is missing."
	);

	console.log(`Container smoke test passed at ${baseUrl}.`);
} finally {
	docker("rm", "--force", name);
}
