import type { RoleKey } from "../../generated/prisma/enums";

export interface AuthPrincipal {
	email: string;
	roles: RoleKey[];
	sub: string;
}

export interface AuthUser {
	displayName: string | null;
	email: string;
	id: string;
	passwordHash: string | null;
	roles: RoleKey[];
}

export interface AuthSession {
	expiresAt: Date;
	id: string;
	revokedAt: Date | null;
	tokenHash: string;
	user: AuthUser;
}

export interface IssuedSession {
	accessToken: string;
	expiresIn: number;
	refreshToken: string;
	user: Omit<AuthUser, "passwordHash">;
}
