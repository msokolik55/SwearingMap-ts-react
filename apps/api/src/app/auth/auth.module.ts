import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { AuthController } from "./auth.controller";
import { AUTH_REPOSITORY } from "./auth.repository";
import { AuthService } from "./auth.service";
import { resolveAuthConfig } from "./auth-config";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { JwtStrategy } from "./jwt.strategy";
import { PrismaAuthRepository } from "./prisma-auth.repository";
import { RolesGuard } from "./roles.guard";

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: "jwt" }),
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const config = resolveAuthConfig(configService);
				return {
					secret: config.accessTokenSecret,
					signOptions: {
						audience: config.accessTokenAudience,
						expiresIn: config.accessTokenTtlSeconds,
						issuer: config.accessTokenIssuer,
					},
				};
			},
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtStrategy,
		{ provide: AUTH_REPOSITORY, useClass: PrismaAuthRepository },
		{ provide: APP_GUARD, useClass: JwtAuthGuard },
		{ provide: APP_GUARD, useClass: RolesGuard },
	],
	exports: [AuthService],
})
export class AuthModule {}
