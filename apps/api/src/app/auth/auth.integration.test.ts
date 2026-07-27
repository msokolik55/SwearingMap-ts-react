import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PrismaService } from "../database/prisma.service";
import { createApiApplication } from "../api-application";

describe("authentication API integration", () => {
	let app: INestApplication;
	let prisma: PrismaService;
	const email = "auth-integration@example.invalid";

	beforeAll(async () => {
		app = await createApiApplication({ logger: false });
		await app.init();
		prisma = app.get(PrismaService);
	});

	afterAll(async () => {
		await prisma.user.deleteMany({ where: { email } });
		await app.close();
	});

	it("registers, authenticates, rotates, protects, and revokes a session", async () => {
		const registration = await request(app.getHttpServer())
			.post("/api/v1/auth/register")
			.send({
				displayName: "Integration Learner",
				email,
				password: "correct horse battery staple",
			})
			.expect(201);

		expect(registration.body.user).toMatchObject({
			displayName: "Integration Learner",
			email,
			roles: ["USER"],
		});
		expect(registration.body.user).not.toHaveProperty("passwordHash");

		const profile = await request(app.getHttpServer())
			.get("/api/v1/auth/me")
			.set("Authorization", `Bearer ${registration.body.accessToken}`)
			.expect(200);
		expect(profile.body).toMatchObject({ email, roles: ["USER"] });

		const signIn = await request(app.getHttpServer())
			.post("/api/v1/auth/sign-in")
			.send({
				email: email.toUpperCase(),
				password: "correct horse battery staple",
			})
			.expect(200);

		const refresh = await request(app.getHttpServer())
			.post("/api/v1/auth/refresh")
			.send({ refreshToken: signIn.body.refreshToken })
			.expect(200);
		expect(refresh.body.refreshToken).not.toBe(signIn.body.refreshToken);

		await request(app.getHttpServer())
			.post("/api/v1/auth/refresh")
			.send({ refreshToken: signIn.body.refreshToken })
			.expect(401);

		await request(app.getHttpServer())
			.post("/api/v1/auth/logout")
			.send({ refreshToken: refresh.body.refreshToken })
			.expect(204);
		await request(app.getHttpServer())
			.post("/api/v1/auth/refresh")
			.send({ refreshToken: refresh.body.refreshToken })
			.expect(401);
	});
});
