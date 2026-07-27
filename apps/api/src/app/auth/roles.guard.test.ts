import type { ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { describe, expect, it, vi } from "vitest";

import { RoleKey } from "../../generated/prisma/enums";
import { RolesGuard } from "./roles.guard";

function contextFor(roles: RoleKey[]): ExecutionContext {
	return {
		getClass: vi.fn(),
		getHandler: vi.fn(),
		switchToHttp: () => ({
			getRequest: () => ({
				user: {
					email: "user@example.com",
					roles,
					sub: "fdc04f1d-4aee-4329-9b55-940679ad0fd4",
				},
			}),
		}),
	} as unknown as ExecutionContext;
}

describe("RolesGuard", () => {
	it("requires at least one declared role", () => {
		const reflector = {
			getAllAndOverride: vi.fn().mockReturnValue([RoleKey.ADMIN]),
		} as unknown as Reflector;
		const guard = new RolesGuard(reflector);

		expect(guard.canActivate(contextFor([RoleKey.USER]))).toBe(false);
		expect(guard.canActivate(contextFor([RoleKey.USER, RoleKey.ADMIN]))).toBe(true);
	});

	it("allows authenticated requests when no role metadata is declared", () => {
		const reflector = {
			getAllAndOverride: vi.fn().mockReturnValue(undefined),
		} as unknown as Reflector;

		expect(new RolesGuard(reflector).canActivate(contextFor([]))).toBe(true);
	});
});
