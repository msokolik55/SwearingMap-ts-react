import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
const lighthouseConfig = readFileSync("lighthouserc.cjs", "utf8");
const changePlan = readFileSync("scripts/ci-change-plan.mjs", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const changesJob = workflow.match(
	/^ {2}changes:\r?\n(?<body>[\s\S]*?)(?=^ {2}quality:)/mu
)?.groups?.body;

test("exposes the CI change planner as a package entry point", () => {
	assert.equal(
		packageJson.scripts["ci:change-plan"],
		"node scripts/ci-change-plan.mjs"
	);
	assert.ok(changesJob, "changes job must exist");

	const pnpmSetup = changesJob.indexOf("uses: pnpm/action-setup@v6");
	const nodeSetup = changesJob.indexOf("uses: actions/setup-node@v7");
	const changePlan = changesJob.indexOf("run: pnpm ci:change-plan");

	assert.ok(pnpmSetup >= 0, "changes job must install pnpm");
	assert.ok(nodeSetup > pnpmSetup, "changes job must configure Node.js after pnpm");
	assert.ok(changePlan > nodeSetup, "toolchain must be ready before the change plan");
});

test("selects affected checks for pull requests and protected-main pushes", () => {
	assert.match(
		changePlan,
		/const selectiveEvent = pullRequest \|\| eventName === "push"/u
	);
	assert.match(
		changePlan,
		/const baseRef = pullRequest \? `origin\/\$\{process\.env\.GITHUB_BASE_REF\}` : "HEAD\^"/u
	);
	assert.match(changePlan, /if \(selectiveEvent\) \{/u);
});

test("runs Fallow directly after successful generation", () => {
	assert.match(
		workflow,
		/- name: Generate source artifacts\s+run: pnpm generate\s+- name: Audit changed code with Fallow/u
	);
	assert.match(
		workflow,
		/- name: Audit changed code with Fallow\s+id: fallow\s+if: github\.event_name == 'pull_request'/u
	);
	assert.match(
		workflow,
		/- name: Audit complete codebase with Fallow\s+if: github\.event_name != 'pull_request'/u
	);
});

test("restores Nx cache and generates source artifacts before quality checks", () => {
	const qualityJob = workflow.match(
		/^ {2}quality:\r?\n(?<body>[\s\S]*?)(?=^ {2}site-build:)/mu
	)?.groups?.body;

	assert.ok(qualityJob, "quality job must exist");
	const cache = qualityJob.indexOf("uses: actions/cache@v5");
	const install = qualityJob.indexOf("run: pnpm install --frozen-lockfile");
	const generate = qualityJob.indexOf("run: pnpm generate");
	const fallow = qualityJob.indexOf("run: pnpm fallow:ci:generated");

	assert.ok(cache >= 0, "quality job must restore the Nx task cache");
	assert.ok(install > cache, "dependencies must be installed after cache restore");
	assert.ok(generate > install, "source generation must run after installation");
	assert.ok(fallow > generate, "Fallow must run after source generation");
	assert.equal(
		qualityJob.match(/run: pnpm generate\r?$/gmu)?.length,
		1,
		"quality job must explicitly generate source artifacts exactly once"
	);
	assert.match(qualityJob, /run: pnpm check:quality:generated/u);
	assert.match(qualityJob, /path: \.nx\/cache/u);
});

test("uploads an attempted pull-request Fallow audit even when it fails", () => {
	assert.match(
		workflow,
		/- name: Upload Fallow SARIF report\s+if: always\(\) && steps\.fallow\.outcome != 'skipped'[\s\S]*?path: \.fallowci\/fallow\.sarif[\s\S]*?if-no-files-found: error/u
	);
});

test("continues independent quality diagnostics unless the run was cancelled", () => {
	assert.match(
		workflow,
		/- name: Audit dependencies\s+if: \$\{\{ !cancelled\(\) && needs\.changes\.outputs\.dependencies == 'true' \}\}/u
	);
	assert.match(
		workflow,
		/- name: Verify complete repository\s+if: \$\{\{ !cancelled\(\) && needs\.changes\.outputs\.full == 'true' \}\}/u
	);
	assert.match(
		workflow,
		/- name: Verify affected changes\s+if: \$\{\{ !cancelled\(\) && needs\.changes\.outputs\.full != 'true' \}\}/u
	);
});

test("runs isolated database migrations and integration tests when selected", () => {
	assert.match(
		workflow,
		/database:\s+name: Database integration[\s\S]*?if: needs\.changes\.outputs\.database == 'true'[\s\S]*?run: pnpm test:database/u
	);
});

test("builds the deployable site once and passes it to browser checks", () => {
	assert.equal(
		packageJson.scripts["build:site"],
		"nx run-many -t build --projects=web,map --parallel=2 && pnpm assemble:site"
	);
	assert.match(
		workflow,
		/site-build:\s+name: Site build[\s\S]*?run: pnpm build:site[\s\S]*?uses: actions\/upload-artifact@v7[\s\S]*?name: site-\$\{\{ github\.run_id \}\}[\s\S]*?path: dist\/site/u
	);
	assert.match(
		workflow,
		/browser:\s+name: Browser quality\s+needs: \[changes, site-build\][\s\S]*?uses: actions\/download-artifact@v8[\s\S]*?name: site-\$\{\{ github\.run_id \}\}[\s\S]*?path: dist\/site/u
	);
	const browserJob = workflow.match(
		/^ {2}browser:\r?\n(?<body>[\s\S]*?)(?=^ {2}container-web:)/mu
	)?.groups?.body;
	assert.ok(browserJob, "browser job must exist");
	assert.doesNotMatch(browserJob, /run: pnpm build:site/u);
	assert.equal(
		packageJson.scripts["check:quality:generated"],
		"pnpm generated:check && pnpm format:check && pnpm lint && pnpm typecheck && pnpm test"
	);
});

test("restores a cross-job-compatible Nx cache for site builds", () => {
	const qualityKey =
		"key: nx-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}-quality-${{ github.sha }}";
	const siteKey =
		"key: nx-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}-site-${{ github.sha }}";
	const sharedPrefix = "nx-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}-";

	assert.ok(workflow.includes(qualityKey));
	assert.ok(workflow.includes(siteKey));
	assert.equal(
		workflow.split(sharedPrefix).length - 1 >= 4,
		true,
		"quality and site build jobs must share a compatible restore prefix"
	);
});

test("uses fewer Lighthouse runs for pull requests", () => {
	assert.match(
		workflow,
		/LIGHTHOUSE_RUNS: \$\{\{ github\.event_name == 'pull_request' && '1' \|\| '3' \}\}/u
	);
	assert.match(
		lighthouseConfig,
		/const numberOfRuns = Number\(process\.env\.LIGHTHOUSE_RUNS \?\? 3\)/u
	);
});

test("caches Playwright Chromium while installing system dependencies on every runner", () => {
	assert.match(
		workflow,
		/- name: Restore Playwright browser cache\s+id: playwright-cache\s+uses: actions\/cache@v5[\s\S]*?path: ~\/\.cache\/ms-playwright[\s\S]*?key: playwright-\$\{\{ runner\.os \}\}-\$\{\{ hashFiles\('pnpm-lock\.yaml'\) \}\}/u
	);
	assert.match(
		workflow,
		/- name: Install Playwright system dependencies\s+run: pnpm exec playwright install-deps chromium/u
	);
	assert.match(
		workflow,
		/- name: Install Playwright browser\s+if: steps\.playwright-cache\.outputs\.cache-hit != 'true'\s+run: pnpm exec playwright install chromium/u
	);
});

test("builds web and API containers independently with persistent Buildx caches", () => {
	assert.match(
		workflow,
		/container-web:\s+name: Production web container[\s\S]*?if: needs\.changes\.outputs\.container_web == 'true'[\s\S]*?uses: docker\/build-push-action@v7[\s\S]*?file: Dockerfile[\s\S]*?cache-from: type=gha,scope=web-container[\s\S]*?cache-to: type=gha,mode=max,scope=web-container/u
	);
	assert.match(
		workflow,
		/container-api:\s+name: Production API container[\s\S]*?if: needs\.changes\.outputs\.container_api == 'true'[\s\S]*?uses: docker\/build-push-action@v7[\s\S]*?file: docker\/api\.Dockerfile[\s\S]*?cache-from: type=gha,scope=api-container[\s\S]*?cache-to: type=gha,mode=max,scope=api-container/u
	);
});
