const DEFAULT_DEVELOPMENT_DATABASE_URL =
	"postgresql://swearing_map:swearing_map@127.0.0.1:5432/swearing_map?schema=public";

export function resolveDatabaseUrl(configuredUrl = process.env.DATABASE_URL): string {
	if (configuredUrl) return configuredUrl;
	if (process.env.NODE_ENV === "production") {
		throw new Error("DATABASE_URL is required in production.");
	}
	return DEFAULT_DEVELOPMENT_DATABASE_URL;
}
