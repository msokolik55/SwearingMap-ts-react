import { spawnSync } from "node:child_process";

export function docker(...args) {
	return spawnSync("docker", args, {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
}

export function assert(condition, message) {
	if (!condition) throw new Error(message);
}

export function assertNonRootImage(image, label) {
	const imageUser = docker("image", "inspect", "--format", "{{.Config.User}}", image);
	const failureDetail =
		imageUser.stderr?.trim() ||
		imageUser.error?.message ||
		"docker image inspect returned no diagnostics";
	assert(imageUser.status === 0, `Unable to inspect image:\n${failureDetail}`);
	assert(
		!["", "0", "root"].includes(imageUser.stdout.trim()),
		`${label} must declare a non-root user.`
	);
}
