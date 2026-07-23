import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const workspaceRoot = process.cwd();
const webOutput = resolve(workspaceRoot, "apps/web/out");
const mapOutput = resolve(workspaceRoot, "apps/map/dist");
const siteOutput = resolve(workspaceRoot, "dist/site");
const mapRouteOutput = resolve(siteOutput, "map");

for (const [name, output] of [
	["Next.js shell", webOutput],
	["Vite map", mapOutput],
]) {
	if (!existsSync(output)) {
		throw new Error(
			`${name} output is missing at ${output}. Run the Nx builds first.`
		);
	}
}

rmSync(siteOutput, { recursive: true, force: true });
mkdirSync(siteOutput, { recursive: true });
cpSync(webOutput, siteOutput, { recursive: true });
mkdirSync(mapRouteOutput, { recursive: true });
cpSync(mapOutput, mapRouteOutput, { recursive: true });

console.log(`Assembled deployable site at ${siteOutput}.`);
