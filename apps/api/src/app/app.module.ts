import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { GeographyModule } from "./geography/geography.module";
import { HealthModule } from "./health/health.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			cache: true,
			envFilePath: [".env.local", ".env"],
			isGlobal: true,
		}),
		ThrottlerModule.forRoot([{ limit: 100, ttl: 60_000 }]),
		DatabaseModule,
		AuthModule,
		GeographyModule,
		HealthModule,
	],
	providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
