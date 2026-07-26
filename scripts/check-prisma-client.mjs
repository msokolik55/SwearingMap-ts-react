import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";

const pnpmEntrypoint = process.env.npm_execpath;
if (!pnpmEntrypoint) {
	throw new Error("Run this check through pnpm.");
}

const schemaPath = resolve("apps/api/prisma/schema.prisma");
const committedRoot = resolve("apps/api/src/generated/prisma");
const temporaryRoot = mkdtempSync(join(tmpdir(), "swearing-map-prisma-"));
const temporarySchema = join(temporaryRoot, "schema.prisma");
const temporaryOutput = join(temporaryRoot, "generated").replaceAll("\\", "/");

function listFiles(root, current = root) {
	return readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
		const path = join(current, entry.name);
		return entry.isDirectory()
			? listFiles(root, path)
			: [relative(root, path).replaceAll("\\", "/")];
	});
}

function normalize(content) {
	return content
		.replaceAll("\r\n", "\n")
		.replaceAll(temporaryOutput, "../src/generated/prisma")
		.replaceAll(temporaryOutput.replaceAll("/", "\\\\"), "../src/generated/prisma");
}

try {
	const schema = readFileSync(schemaPath, "utf8").replace(
		/output\s*=\s*"\.\.\/src\/generated\/prisma"/u,
		`output          = "${temporaryOutput}"`
	);
	writeFileSync(join(temporaryRoot, "package.json"), '{"type":"module"}\n');
	writeFileSync(temporarySchema, schema);

	const generated = spawnSync(
		process.execPath,
		[pnpmEntrypoint, "exec", "prisma", "generate", "--schema", temporarySchema],
		{
			encoding: "utf8",
			maxBuffer: 10 * 1024 * 1024,
			stdio: ["ignore", "pipe", "pipe"],
		}
	);
	if (generated.status !== 0) {
		const diagnostic =
			generated.error?.stack ??
			generated.stderr ??
			generated.stdout ??
			`Process exited with status ${generated.status} and signal ${generated.signal}.`;
		throw new Error(`Prisma client generation failed:\n${diagnostic}`);
	}

	const expectedFiles = listFiles(committedRoot).sort();
	const actualFiles = listFiles(join(temporaryRoot, "generated")).sort();
	const drift = new Set(
		expectedFiles.length === actualFiles.length &&
			expectedFiles.every((file, index) => file === actualFiles[index])
			? []
			: [...expectedFiles, ...actualFiles]
	);

	for (const file of new Set([...expectedFiles, ...actualFiles])) {
		const expectedContent = expectedFiles.includes(file)
			? normalize(readFileSync(join(committedRoot, file), "utf8"))
			: undefined;
		const actualContent = actualFiles.includes(file)
			? normalize(readFileSync(join(temporaryRoot, "generated", file), "utf8"))
			: undefined;
		if (
			!expectedFiles.includes(file) ||
			!actualFiles.includes(file) ||
			expectedContent !== actualContent
		) {
			drift.add(file);
			if (
				process.env.PRISMA_DRIFT_DEBUG === "true" &&
				expectedContent &&
				actualContent
			) {
				const expectedLines = expectedContent.split("\n");
				const actualLines = actualContent.split("\n");
				const line = expectedLines.findIndex(
					(value, index) => value !== actualLines[index]
				);
				console.error({
					file,
					line: line + 1,
					expected: expectedLines[line],
					actual: actualLines[line],
				});
				break;
			}
		}
	}

	if (drift.size) {
		console.error("Generated Prisma Client is stale:");
		for (const file of [...drift].sort()) console.error(`- ${file}`);
		console.error("Run `pnpm db:generate` and commit the generated client.");
		process.exitCode = 1;
	} else {
		console.log("Generated Prisma Client is current.");
	}
} finally {
	rmSync(temporaryRoot, { force: true, recursive: true });
}
