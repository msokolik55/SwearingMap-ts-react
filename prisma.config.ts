import "dotenv/config";

import { defineConfig } from "prisma/config";

const defaultDatabaseUrl =
	"postgresql://swearing_map:swearing_map@127.0.0.1:5432/swearing_map?schema=public";

export default defineConfig({
	schema: "apps/api/prisma",
	migrations: {
		path: "apps/api/prisma/migrations",
		seed: "tsx apps/api/prisma/seed.ts",
	},
	datasource: {
		url: process.env.DATABASE_URL ?? defaultDatabaseUrl,
		...(process.env.SHADOW_DATABASE_URL
			? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL }
			: {}),
	},
});
