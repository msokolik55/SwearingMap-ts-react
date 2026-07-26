import { defineConfig } from "@hey-api/openapi-ts";

const contractRoot =
	process.env.API_CONTRACT_ROOT?.replaceAll("\\", "/") ?? "libs/api-client";

export default defineConfig({
	input: `${contractRoot}/openapi.json`,
	output: `${contractRoot}/src/generated`,
});
