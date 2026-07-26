import assert from "node:assert/strict";
import test from "node:test";

import config from "../lint-staged.config.mjs";

const codeTasks = config["*.{js,cjs,mjs,jsx,ts,tsx}"];
const rootLintTask = codeTasks[1];
const webLintTask = config["apps/web/**/*.{js,cjs,mjs,jsx,ts,tsx}"];

test("routes staged Next.js files through the web ESLint configuration", () => {
	const webFile = "C:\\workspace\\apps\\web\\app\\page.tsx";
	const rootFile = "C:\\workspace\\scripts\\verify-changed.mjs";

	const rootCommand = rootLintTask([webFile, rootFile]);
	const webCommand = webLintTask([webFile]);

	assert.match(rootCommand, /scripts\\verify-changed\.mjs/u);
	assert.doesNotMatch(rootCommand, /apps\\web\\app\\page\.tsx/u);
	assert.match(webCommand, /--config apps\/web\/eslint\.config\.js/u);
	assert.match(webCommand, /apps\\web\\app\\page\.tsx/u);
});

test("keeps generated API client files out of hand-authored lint", () => {
	const generatedFile = "C:\\workspace\\libs\\api-client\\src\\generated\\sdk.gen.ts";
	const rootFile = "C:\\workspace\\libs\\api-client\\src\\index.ts";

	const rootCommand = rootLintTask([generatedFile, rootFile]);

	assert.match(rootCommand, /libs\\api-client\\src\\index\.ts/u);
	assert.doesNotMatch(rootCommand, /generated\\sdk\.gen\.ts/u);
});

test("keeps generated Prisma files out of hand-authored lint", () => {
	const generatedFile = "C:\\workspace\\apps\\api\\src\\generated\\prisma\\client.ts";
	const rootFile = "C:\\workspace\\apps\\api\\src\\main.ts";

	const rootCommand = rootLintTask([generatedFile, rootFile]);

	assert.match(rootCommand, /apps\\api\\src\\main\.ts/u);
	assert.doesNotMatch(rootCommand, /generated\\prisma\\client\.ts/u);
});
