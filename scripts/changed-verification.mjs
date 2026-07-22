const FULL_IMPACT_PATTERNS = [
	/^\.github\//u,
	/^package\.json$/u,
	/^pnpm-lock\.yaml$/u,
	/^pnpm-workspace\.yaml$/u,
	/^eslint\.config\./u,
	/^tsconfig(?:\.|$)/u,
	/^vite\.config\./u,
	/^vitest\.config\./u,
	/^playwright\.config\./u,
	/^lighthouserc\./u,
	/^performance-budget\.json$/u,
	/^commitlint\.config\./u,
	/^lint-staged\.config\./u,
	/^\.husky\//u,
	/^scripts\/changed-verification\.mjs$/u,
	/^scripts\/verify-changed\.mjs$/u,
];

const CODE_PATTERN = /\.(?:cjs|js|jsx|mjs|ts|tsx)$/u;
const FORMAT_PATTERN = /\.(?:cjs|css|html|js|json|jsonc|jsx|md|mjs|ts|tsx|yaml|yml)$/u;
const TYPESCRIPT_PATTERN = /\.(?:ts|tsx)$/u;

export function requiresFullVerification(files) {
	return files.some((file) =>
		FULL_IMPACT_PATTERNS.some((pattern) => pattern.test(file))
	);
}

export function classifyChanges(files) {
	const existing = files.filter((file) => !file.deleted);
	const paths = existing.map((file) => file.path);

	return {
		allPaths: files.map((file) => file.path),
		codePaths: paths.filter((file) => CODE_PATTERN.test(file)),
		formatPaths: paths.filter((file) => FORMAT_PATTERN.test(file)),
		typeScriptChanged: paths.some((file) => TYPESCRIPT_PATTERN.test(file)),
		appChanged: paths.some((file) =>
			/^(?:e2e\/|index\.html$|public\/|src\/|playwright\.config\.)/u.test(file)
		),
		containerChanged: paths.some((file) =>
			/^(?:Dockerfile$|\.dockerignore$|docker\/|scripts\/smoke-container\.mjs$)/u.test(
				file
			)
		),
	};
}

export function parseNameStatus(output, pathExists = existsSync) {
	const fields = output.split("\0").filter(Boolean);
	const files = [];
	let index = 0;

	while (index < fields.length) {
		const status = fields[index++];
		const hasSourcePath = status.startsWith("R") || status.startsWith("C");
		index += Number(hasSourcePath);
		const path = fields[index++];
		files.push({ path, deleted: status === "D" || !pathExists(path) });
	}

	return files;
}
import { existsSync } from "node:fs";
