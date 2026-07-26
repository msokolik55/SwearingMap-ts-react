import { VersioningType, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import "class-transformer";
import "class-validator";

import { AppModule } from "./app.module";
import { configureOpenApi } from "./openapi";

interface ApiApplicationOptions {
	logger?: false;
	swagger?: boolean;
}

export async function createApiApplication(
	options: ApiApplicationOptions = {}
): Promise<NestExpressApplication> {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		logger: options.logger,
	});

	app.setGlobalPrefix("api");
	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: "1",
	});
	app.useGlobalPipes(
		new ValidationPipe({
			forbidNonWhitelisted: true,
			transform: true,
			whitelist: true,
		})
	);

	if (options.swagger !== false) {
		configureOpenApi(app);
	}

	return app;
}
