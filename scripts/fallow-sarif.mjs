import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const EMPTY_FALLOW_SARIF = {
	version: "2.1.0",
	$schema: "https://json.schemastore.org/sarif-2.1.0.json",
	runs: [
		{
			tool: {
				driver: {
					name: "Fallow",
					informationUri: "https://fallow.tools",
					rules: [],
				},
			},
			results: [],
		},
	],
};

export function initializeFallowSarif(outputPath) {
	mkdirSync(dirname(outputPath), { recursive: true });
	writeFileSync(outputPath, `${JSON.stringify(EMPTY_FALLOW_SARIF, null, 2)}\n`);
}
