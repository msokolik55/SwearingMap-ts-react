const quote = (file) => `"${file}"`;
const isWebFile = (file) => file.replaceAll("\\", "/").includes("/apps/web/");
const isGeneratedClient = (file) => {
	const normalized = file.replaceAll("\\", "/");
	return (
		normalized.includes("/apps/api/src/generated/prisma/") ||
		normalized.includes("/libs/api-client/src/generated/")
	);
};

export default {
	"*.{js,cjs,mjs,jsx,ts,tsx}": [
		"prettier --write",
		(files) => {
			const rootFiles = files.filter(
				(file) => !isWebFile(file) && !isGeneratedClient(file)
			);
			return rootFiles.length
				? `eslint --fix --max-warnings=0 ${rootFiles.map(quote).join(" ")}`
				: [];
		},
	],
	"apps/web/**/*.{js,cjs,mjs,jsx,ts,tsx}": (files) =>
		`eslint --fix --max-warnings=0 --config apps/web/eslint.config.js ${files
			.map(quote)
			.join(" ")}`,
	"*.{css,html,json,jsonc,md,yaml,yml}": "prettier --write --ignore-unknown",
};
