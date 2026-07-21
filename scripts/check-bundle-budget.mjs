import { readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve } from "node:path";

const root = process.cwd();
const budget = JSON.parse(readFileSync(resolve(root, "performance-budget.json"), "utf8"));
const manifest = JSON.parse(
	readFileSync(resolve(root, "dist/.vite/manifest.json"), "utf8")
);

const entryKey = Object.keys(manifest).find((key) => manifest[key].isEntry);
if (!entryKey) {
	throw new Error("Vite manifest does not contain an entry module.");
}

const initialFiles = new Set();
const visit = (key) => {
	const chunk = manifest[key];
	if (!chunk || initialFiles.has(chunk.file)) {
		return;
	}

	initialFiles.add(chunk.file);
	for (const importedKey of chunk.imports ?? []) {
		visit(importedKey);
	}
};
visit(entryKey);

const initialJavaScript = [...initialFiles]
	.filter((file) => file.endsWith(".js"))
	.map((file) => readFileSync(resolve(root, "dist", file)));
const initialJavaScriptBytes = initialJavaScript.reduce(
	(total, file) => total + file.byteLength,
	0
);
const initialJavaScriptGzipBytes = initialJavaScript.reduce(
	(total, file) => total + gzipSync(file).byteLength,
	0
);
const borderDataBytes = statSync(resolve(root, "dist/data/borders.json")).size;

const measurements = {
	initialJavaScriptBytes,
	initialJavaScriptGzipBytes,
	borderDataBytes,
};

let failed = false;
for (const [name, actual] of Object.entries(measurements)) {
	const limit = budget[name];
	const passed = actual <= limit;
	console.log(`${passed ? "PASS" : "FAIL"} ${name}: ${actual} / ${limit} bytes`);
	failed ||= !passed;
}

if (failed) {
	process.exitCode = 1;
}
