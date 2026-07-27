import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from "@nestjs/swagger";

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
	const config = new DocumentBuilder()
		.setTitle("Swearing Map API")
		.setDescription("Public contract for the Swearing Map product platform.")
		.setVersion("1.0.0")
		.addBearerAuth()
		.build();

	return SwaggerModule.createDocument(app, config);
}

export function configureOpenApi(app: INestApplication): OpenAPIObject {
	const document = createOpenApiDocument(app);

	SwaggerModule.setup("api/docs", app, document, {
		jsonDocumentUrl: "api/openapi.json",
	});

	return document;
}
