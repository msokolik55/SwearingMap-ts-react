import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { RoleKey } from "../../generated/prisma/enums";
import { resolveAuthConfig } from "./auth-config";
import type { AuthPrincipal } from "./auth.types";

function isRole(value: unknown): value is RoleKey {
	return typeof value === "string" && Object.values(RoleKey).includes(value as RoleKey);
}

function requireString(value: unknown): string {
	if (typeof value !== "string") throw new UnauthorizedException();
	return value;
}

function requireRoles(value: unknown): RoleKey[] {
	if (!Array.isArray(value) || !value.every(isRole)) {
		throw new UnauthorizedException();
	}
	return value;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(@Inject(ConfigService) configService: ConfigService) {
		const config = resolveAuthConfig(configService);
		super({
			audience: config.accessTokenAudience,
			issuer: config.accessTokenIssuer,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.accessTokenSecret,
		});
	}

	validate(payload: Partial<AuthPrincipal>): AuthPrincipal {
		return {
			email: requireString(payload.email),
			roles: requireRoles(payload.roles),
			sub: requireString(payload.sub),
		};
	}
}
