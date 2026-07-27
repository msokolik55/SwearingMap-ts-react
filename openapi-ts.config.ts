import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
	input: "libs/api-client/openapi.json",
	output: "libs/api-client/src/generated",
});
