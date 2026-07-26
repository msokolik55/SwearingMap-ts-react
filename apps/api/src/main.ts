import { Logger } from "@nestjs/common";

import { createApiApplication } from "./app/api-application";

async function bootstrap() {
	const app = await createApiApplication();
	const port = process.env.PORT || 3000;

	await app.listen(port);
	Logger.log(`API is running at http://localhost:${port}/api`);
}

void bootstrap();
