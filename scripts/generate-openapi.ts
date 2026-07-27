import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { createApiApplication } from "../apps/api/src/app/api-application";
import { createOpenApiDocument } from "../apps/api/src/app/openapi";

const contractRoot = resolve("libs/api-client");
const outputPath = resolve(contractRoot, "openapi.json");
const app = await createApiApplication({ logger: false, swagger: false });

try {
	const document = createOpenApiDocument(app);

	await mkdir(contractRoot, { recursive: true });
	await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
	console.log(`OpenAPI contract written to ${outputPath}`);
} finally {
	await app.close();
}
