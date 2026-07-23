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
