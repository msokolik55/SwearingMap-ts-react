import { createHash, randomBytes } from "node:crypto";

import {
	ConflictException,
	Inject,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { hash, verify, argon2id } from "argon2";

import type { AuthRepository } from "./auth.repository";
import { AUTH_REPOSITORY } from "./auth.repository";
import { toPublicAuthUser } from "./auth-user.mapper";
import { resolveAuthConfig } from "./auth-config";
import type { AuthUser, IssuedSession } from "./auth.types";
import type { RegisterDto } from "./dto/register.dto";

const passwordHashOptions = {
	memoryCost: 19_456,
	parallelism: 1,
	timeCost: 2,
	type: argon2id,
} as const;

const INVALID_CREDENTIALS = "Invalid email or password.";
const INVALID_SESSION = "Invalid or expired session.";

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

function hashRefreshToken(token: string): string {
	return createHash("sha256").update(token, "utf8").digest("base64url");
}

function isUniqueConstraintError(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		error.code === "P2002"
	);
}

@Injectable()
export class AuthService {
	private readonly config;

	constructor(
		@Inject(AUTH_REPOSITORY) private readonly repository: AuthRepository,
		@Inject(JwtService) private readonly jwtService: JwtService,
		@Inject(ConfigService) configService: ConfigService
	) {
		this.config = resolveAuthConfig(configService);
	}

	async register(input: RegisterDto): Promise<IssuedSession> {
		const email = normalizeEmail(input.email);
		const passwordHash = await hash(input.password, passwordHashOptions);

		try {
			const user = await this.repository.createUser({
				displayName: input.displayName?.trim(),
				email,
				passwordHash,
			});
			return this.createSession(user);
		} catch (error: unknown) {
			if (isUniqueConstraintError(error)) {
				throw new ConflictException("An account with this email already exists.");
			}
			throw error;
		}
	}

	async signIn(emailInput: string, password: string): Promise<IssuedSession> {
		const user = await this.repository.findUserByEmail(normalizeEmail(emailInput));
		if (!user?.passwordHash) {
			await hash(password, passwordHashOptions);
			throw new UnauthorizedException(INVALID_CREDENTIALS);
		}

		if (!(await verify(user.passwordHash, password))) {
			throw new UnauthorizedException(INVALID_CREDENTIALS);
		}

		return this.createSession(user);
	}

	async refresh(refreshToken: string): Promise<IssuedSession> {
		const expectedTokenHash = hashRefreshToken(refreshToken);
		const session = await this.requireActiveSession(expectedTokenHash);
		const nextRefreshToken = randomBytes(48).toString("base64url");
		await this.rotateRefreshSession(session.id, expectedTokenHash, nextRefreshToken);

		return {
			accessToken: await this.createAccessToken(session.user),
			expiresIn: this.config.accessTokenTtlSeconds,
			refreshToken: nextRefreshToken,
			user: toPublicAuthUser(session.user),
		};
	}

	private async requireActiveSession(expectedTokenHash: string) {
		const session = await this.repository.findSessionByTokenHash(expectedTokenHash);
		if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
			throw new UnauthorizedException(INVALID_SESSION);
		}
		return session;
	}

	private async rotateRefreshSession(
		sessionId: string,
		expectedTokenHash: string,
		nextRefreshToken: string
	): Promise<void> {
		const rotated = await this.repository.rotateSession({
			expiresAt: this.refreshExpiry(),
			expectedTokenHash,
			id: sessionId,
			tokenHash: hashRefreshToken(nextRefreshToken),
		});
		if (!rotated) throw new UnauthorizedException(INVALID_SESSION);
	}

	async logout(refreshToken: string): Promise<void> {
		await this.repository.revokeSession(hashRefreshToken(refreshToken), new Date());
	}

	private async createSession(user: AuthUser): Promise<IssuedSession> {
		const refreshToken = randomBytes(48).toString("base64url");
		await this.repository.createSession({
			expiresAt: this.refreshExpiry(),
			tokenHash: hashRefreshToken(refreshToken),
			userId: user.id,
		});

		return {
			accessToken: await this.createAccessToken(user),
			expiresIn: this.config.accessTokenTtlSeconds,
			refreshToken,
			user: toPublicAuthUser(user),
		};
	}

	private createAccessToken(user: AuthUser): Promise<string> {
		return this.jwtService.signAsync(
			{ email: user.email, roles: user.roles },
			{ subject: user.id }
		);
	}

	private refreshExpiry(): Date {
		return new Date(Date.now() + this.config.refreshTokenTtlSeconds * 1_000);
	}
}
