import type { RoleKey } from "../../generated/prisma/enums";
import type { AuthUser } from "./auth.types";

interface SelectedAuthUser {
	displayName: string | null;
	email: string;
	id: string;
	passwordHash: string | null;
	roles: Array<{ roleKey: RoleKey }>;
}

export function mapSelectedAuthUser(user: SelectedAuthUser): AuthUser {
	return {
		displayName: user.displayName,
		email: user.email,
		id: user.id,
		passwordHash: user.passwordHash,
		roles: user.roles.map(({ roleKey }) => roleKey),
	};
}

export function toPublicAuthUser(user: AuthUser): Omit<AuthUser, "passwordHash"> {
	return {
		displayName: user.displayName,
		email: user.email,
		id: user.id,
		roles: user.roles,
	};
}
