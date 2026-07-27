const DEVELOPMENT_ACCESS_SECRET =
	"development-only-access-secret-change-before-production";

interface ConfigurationReader {
	get<T>(key: string): T | undefined;
}

export interface AuthConfig {
	accessTokenAudience: string;
	accessTokenIssuer: string;
	accessTokenSecret: string;
	accessTokenTtlSeconds: number;
	refreshTokenTtlSeconds: number;
}

function readOrDefault(
	config: ConfigurationReader,
	key: string,
	fallback: string
): string {
	return config.get<string>(key) ?? fallback;
}

function readAccessTokenSecret(config: ConfigurationReader): string {
	const configuredSecret = config.get<string>("AUTH_ACCESS_TOKEN_SECRET");
	if (configuredSecret) return configuredSecret;
	if (config.get<string>("NODE_ENV") !== "production") {
		return DEVELOPMENT_ACCESS_SECRET;
	}

	throw new Error("AUTH_ACCESS_TOKEN_SECRET is required in production.");
}

function requireStrongSecret(secret: string): string {
	if (secret.length < 32) {
		throw new Error("AUTH_ACCESS_TOKEN_SECRET must contain at least 32 characters.");
	}
	return secret;
}

export function resolveAuthConfig(config: ConfigurationReader): AuthConfig {
	return {
		accessTokenAudience: readOrDefault(
			config,
			"AUTH_ACCESS_TOKEN_AUDIENCE",
			"swearing-map-web"
		),
		accessTokenIssuer: readOrDefault(
			config,
			"AUTH_ACCESS_TOKEN_ISSUER",
			"swearing-map-api"
		),
		accessTokenSecret: requireStrongSecret(readAccessTokenSecret(config)),
		accessTokenTtlSeconds: 15 * 60,
		refreshTokenTtlSeconds: 30 * 24 * 60 * 60,
	};
}
