import { ConfigService } from "@nestjs/config";
import { describe, expect, it } from "vitest";

import { resolveAuthConfig } from "./auth-config";

describe("auth configuration", () => {
	it("uses bounded development defaults outside production", () => {
		const config = resolveAuthConfig(new ConfigService({ NODE_ENV: "test" }));

		expect(config.accessTokenTtlSeconds).toBe(900);
		expect(config.refreshTokenTtlSeconds).toBe(2_592_000);
		expect(config.accessTokenSecret.length).toBeGreaterThanOrEqual(32);
	});

	it("requires a strong access-token secret in production", () => {
		expect(() =>
			resolveAuthConfig(new ConfigService({ NODE_ENV: "production" }))
		).toThrow("AUTH_ACCESS_TOKEN_SECRET is required in production");

		expect(() =>
			resolveAuthConfig(
				new ConfigService({
					AUTH_ACCESS_TOKEN_SECRET: "too-short",
					NODE_ENV: "production",
				})
			)
		).toThrow("at least 32 characters");
	});
});
