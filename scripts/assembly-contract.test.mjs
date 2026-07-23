import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const lighthouse = readFileSync("lighthouserc.cjs", "utf8");
const nginx = readFileSync("docker/nginx.conf", "utf8");
const vite = readFileSync("apps/map/vite.config.ts", "utf8");

test("build assembles the Next.js shell and isolated map for every runtime", () => {
	assert.match(packageJson.scripts.build, /pnpm assemble:site/u);
	assert.equal(packageJson.scripts.preview, "vite preview --outDir dist/site");
	assert.match(lighthouse, /staticDistDir: "\.\/dist\/site"/u);
});

test("mounts the legacy map and its cache policies below the map route", () => {
	assert.match(vite, /base: "\/map\/"/u);
	assert.match(nginx, /location \/map\/ \{/u);
	assert.match(nginx, /location \/map\/assets\/ \{/u);
	assert.match(nginx, /location \/map\/data\/ \{/u);
	assert.match(nginx, /try_files \$uri \$uri\/ \/map\/index\.html;/u);
});
