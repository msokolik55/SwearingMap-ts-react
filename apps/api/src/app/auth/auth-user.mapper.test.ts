import { describe, expect, it } from "vitest";

import { RoleKey } from "../../generated/prisma/enums";
import { mapSelectedAuthUser, toPublicAuthUser } from "./auth-user.mapper";

describe("authentication user mapping", () => {
	it("maps selected persistence data to the authentication model", () => {
		expect(
			mapSelectedAuthUser({
				displayName: "Learner",
				email: "learner@example.com",
				id: "58df5448-b547-4854-99a4-aa197aad184c",
				passwordHash: "secret-hash",
				roles: [{ roleKey: RoleKey.USER }],
			})
		).toEqual({
			displayName: "Learner",
			email: "learner@example.com",
			id: "58df5448-b547-4854-99a4-aa197aad184c",
			passwordHash: "secret-hash",
			roles: [RoleKey.USER],
		});
	});

	it("removes credentials from the public representation", () => {
		const result = toPublicAuthUser({
			displayName: null,
			email: "learner@example.com",
			id: "58df5448-b547-4854-99a4-aa197aad184c",
			passwordHash: "secret-hash",
			roles: [RoleKey.USER],
		});

		expect(result).not.toHaveProperty("passwordHash");
	});
});
