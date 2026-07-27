import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { verify } from "argon2";
import { describe, expect, it } from "vitest";

import { RoleKey } from "../../generated/prisma/enums";
import type { AuthRepository, CreateAuthUser } from "./auth.repository";
import { AuthService } from "./auth.service";
import type { AuthSession, AuthUser } from "./auth.types";

class InMemoryAuthRepository implements AuthRepository {
	readonly sessions = new Map<string, AuthSession>();
	readonly users = new Map<string, AuthUser>();

	async createUser(input: CreateAuthUser): Promise<AuthUser> {
		const user: AuthUser = {
			displayName: input.displayName ?? null,
			email: input.email,
			id: "58df5448-b547-4854-99a4-aa197aad184c",
			passwordHash: input.passwordHash,
			roles: [RoleKey.USER],
		};
		this.users.set(user.email, user);
		return user;
	}

	async findUserByEmail(email: string): Promise<AuthUser | null> {
		return this.users.get(email) ?? null;
	}

	async createSession(input: {
		expiresAt: Date;
		tokenHash: string;
		userId: string;
	}): Promise<void> {
		const user = [...this.users.values()].find(({ id }) => id === input.userId);
		if (!user) throw new Error("Unknown user");
		this.sessions.set(input.tokenHash, {
			expiresAt: input.expiresAt,
			id: `session-${this.sessions.size + 1}`,
			revokedAt: null,
			tokenHash: input.tokenHash,
			user,
		});
	}

	async findSessionByTokenHash(tokenHash: string): Promise<AuthSession | null> {
		return this.sessions.get(tokenHash) ?? null;
	}

	async rotateSession(input: {
		expiresAt: Date;
		expectedTokenHash: string;
		id: string;
		tokenHash: string;
	}): Promise<boolean> {
		const session = this.sessions.get(input.expectedTokenHash);
		if (!session || session.id !== input.id || session.revokedAt) return false;
		this.sessions.delete(input.expectedTokenHash);
		this.sessions.set(input.tokenHash, {
			...session,
			expiresAt: input.expiresAt,
			tokenHash: input.tokenHash,
		});
		return true;
	}

	async revokeSession(tokenHash: string, revokedAt: Date): Promise<void> {
		const session = this.sessions.get(tokenHash);
		if (session) session.revokedAt = revokedAt;
	}
}

function createService(repository: InMemoryAuthRepository): AuthService {
	const config = new ConfigService({ NODE_ENV: "test" });
	return new AuthService(
		repository,
		new JwtService({
			secret: "development-only-access-secret-change-before-production",
			signOptions: {
				audience: "swearing-map-web",
				expiresIn: 900,
				issuer: "swearing-map-api",
			},
		}),
		config
	);
}

describe("AuthService", () => {
	it("normalizes email and stores only an Argon2id password hash", async () => {
		const repository = new InMemoryAuthRepository();
		const result = await createService(repository).register({
			displayName: "  Learner  ",
			email: "  LEARNER@Example.com ",
			password: "correct horse battery staple",
		});
		const stored = repository.users.get("learner@example.com");

		expect(result.user).toMatchObject({
			displayName: "Learner",
			email: "learner@example.com",
			roles: [RoleKey.USER],
		});
		expect(result).not.toHaveProperty("user.passwordHash");
		expect(stored?.passwordHash).toMatch(/^\$argon2id\$/u);
		expect(
			await verify(stored?.passwordHash ?? "", "correct horse battery staple")
		).toBe(true);
		expect([...repository.sessions.keys()]).not.toContain(result.refreshToken);
	});

	it("rotates refresh tokens and rejects replay", async () => {
		const repository = new InMemoryAuthRepository();
		const service = createService(repository);
		const registered = await service.register({
			email: "learner@example.com",
			password: "correct horse battery staple",
		});

		const refreshed = await service.refresh(registered.refreshToken);

		expect(refreshed.refreshToken).not.toBe(registered.refreshToken);
		await expect(service.refresh(registered.refreshToken)).rejects.toThrow(
			"Invalid or expired session"
		);
	});
});
