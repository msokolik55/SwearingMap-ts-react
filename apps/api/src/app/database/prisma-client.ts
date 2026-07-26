import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../generated/prisma/client";

export function createPrismaClient(databaseUrl: string): PrismaClient {
	return new PrismaClient({
		adapter: new PrismaPg({
			connectionString: databaseUrl,
			connectionTimeoutMillis: 5_000,
			idleTimeoutMillis: 30_000,
			max: 10,
		}),
	});
}
