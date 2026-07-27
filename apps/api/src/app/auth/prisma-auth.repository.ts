import { Inject, Injectable } from "@nestjs/common";

import { RoleKey } from "../../generated/prisma/enums";
import { PrismaService } from "../database/prisma.service";
import type { AuthRepository, CreateAuthUser } from "./auth.repository";
import type { AuthSession, AuthUser } from "./auth.types";

type AuthDatabaseClient = Pick<PrismaService, "session" | "user">;

const authUserSelection = {
	displayName: true,
	email: true,
	id: true,
	passwordHash: true,
	roles: {
		select: {
			roleKey: true,
		},
	},
} as const;

type SelectedAuthUser = {
	displayName: string | null;
	email: string;
	id: string;
	passwordHash: string | null;
	roles: Array<{ roleKey: RoleKey }>;
};

function mapUser(user: SelectedAuthUser): AuthUser {
	return {
		displayName: user.displayName,
		email: user.email,
		id: user.id,
		passwordHash: user.passwordHash,
		roles: user.roles.map(({ roleKey }) => roleKey),
	};
}

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
	constructor(@Inject(PrismaService) private readonly prisma: AuthDatabaseClient) {}

	async createUser(input: CreateAuthUser): Promise<AuthUser> {
		const user = await this.prisma.user.create({
			data: {
				displayName: input.displayName,
				email: input.email,
				passwordHash: input.passwordHash,
				roles: {
					create: {
						role: {
							connectOrCreate: {
								create: {
									description: "Standard authenticated user",
									key: RoleKey.USER,
								},
								where: { key: RoleKey.USER },
							},
						},
					},
				},
			},
			select: authUserSelection,
		});

		return mapUser(user);
	}

	async findUserByEmail(email: string): Promise<AuthUser | null> {
		const user = await this.prisma.user.findUnique({
			where: { email },
			select: authUserSelection,
		});

		return user ? mapUser(user) : null;
	}

	async createSession(input: {
		expiresAt: Date;
		tokenHash: string;
		userId: string;
	}): Promise<void> {
		await this.prisma.session.create({ data: input });
	}

	async findSessionByTokenHash(tokenHash: string): Promise<AuthSession | null> {
		const session = await this.prisma.session.findUnique({
			where: { tokenHash },
			include: {
				user: {
					select: authUserSelection,
				},
			},
		});

		return session
			? {
					expiresAt: session.expiresAt,
					id: session.id,
					revokedAt: session.revokedAt,
					tokenHash: session.tokenHash,
					user: mapUser(session.user),
				}
			: null;
	}

	async rotateSession(input: {
		expiresAt: Date;
		expectedTokenHash: string;
		id: string;
		tokenHash: string;
	}): Promise<boolean> {
		const result = await this.prisma.session.updateMany({
			where: {
				expiresAt: { gt: new Date() },
				id: input.id,
				revokedAt: null,
				tokenHash: input.expectedTokenHash,
			},
			data: {
				expiresAt: input.expiresAt,
				tokenHash: input.tokenHash,
			},
		});

		return result.count === 1;
	}

	async revokeSession(tokenHash: string, revokedAt: Date): Promise<void> {
		await this.prisma.session.updateMany({
			where: { revokedAt: null, tokenHash },
			data: { revokedAt },
		});
	}
}
