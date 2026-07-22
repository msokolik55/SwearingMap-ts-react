import { spawnSync } from "node:child_process";

function git(args, inherit = false) {
	const result = spawnSync("git", args, {
		encoding: "utf8",
		stdio: inherit ? "inherit" : ["ignore", "pipe", "pipe"],
	});
	if (result.error) throw result.error;
	return result;
}

const branchResult = git(["branch", "--show-current"]);
const branch = branchResult.stdout.trim();

if (branchResult.status !== 0 || !branch) {
	throw new Error("A named local branch is required before pushing.");
}
if (branch === "main") {
	throw new Error(
		"Direct pushes to main are not allowed. Create a short-lived branch first."
	);
}

const upstream = git([
	"rev-parse",
	"--abbrev-ref",
	"--symbolic-full-name",
	"@{upstream}",
]);
const args =
	upstream.status === 0 ? ["push"] : ["push", "--set-upstream", "origin", "HEAD"];
const pushed = git(args, true);
if (pushed.status !== 0) process.exit(pushed.status ?? 1);
