import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createApiApplication } from "../api-application";

describe("health API", () => {
	let app: INestApplication;

	beforeAll(async () => {
		app = await createApiApplication({ logger: false });
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it("exposes the versioned health endpoint", async () => {
		const response = await request(app.getHttpServer())
			.get("/api/v1/health")
			.expect(200);

		expect(response.body).toEqual({
			service: "swearing-map-api",
			status: "ok",
			version: "1.0.0",
		});
	});

	it("publishes the OpenAPI contract", async () => {
		const response = await request(app.getHttpServer())
			.get("/api/openapi.json")
			.expect(200);

		expect(response.body.paths).toHaveProperty("/api/v1/health");
		expect(response.body.paths["/api/v1/health"].get.operationId).toBe("getHealth");
	});
});
