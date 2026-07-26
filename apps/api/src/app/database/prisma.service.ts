import { Inject, Injectable, OnApplicationShutdown } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../generated/prisma/client";
import { resolveDatabaseUrl } from "./database-url";

@Injectable()
export class PrismaService extends PrismaClient implements OnApplicationShutdown {
	constructor(@Inject(ConfigService) config: ConfigService) {
		super({
			adapter: new PrismaPg({
				connectionString: resolveDatabaseUrl(config.get("DATABASE_URL")),
				connectionTimeoutMillis: 5_000,
				idleTimeoutMillis: 30_000,
				max: 10,
			}),
		});
	}

	async onApplicationShutdown(): Promise<void> {
		await this.$disconnect();
	}
}
