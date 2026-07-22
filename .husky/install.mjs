import { existsSync } from "node:fs";

const shouldSkip =
	process.env.CI === "true" ||
	process.env.NODE_ENV === "production" ||
	!existsSync(new URL("../.git", import.meta.url));

if (!shouldSkip) {
	const husky = (await import("husky")).default;
	husky();
}
