import type { AuthSession, AuthUser } from "./auth.types";

export const AUTH_REPOSITORY = Symbol("AUTH_REPOSITORY");

export interface CreateAuthUser {
	displayName?: string;
	email: string;
	passwordHash: string;
}

export interface AuthRepository {
	createSession(input: {
		expiresAt: Date;
		tokenHash: string;
		userId: string;
	}): Promise<void>;
	createUser(input: CreateAuthUser): Promise<AuthUser>;
	findSessionByTokenHash(tokenHash: string): Promise<AuthSession | null>;
	findUserByEmail(email: string): Promise<AuthUser | null>;
	revokeSession(tokenHash: string, revokedAt: Date): Promise<void>;
	rotateSession(input: {
		expiresAt: Date;
		expectedTokenHash: string;
		id: string;
		tokenHash: string;
	}): Promise<boolean>;
}
