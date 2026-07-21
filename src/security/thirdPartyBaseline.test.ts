import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("third-party content baseline", () => {
	const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");

	it("does not load remote scripts or styles before user consent", () => {
		expect(html).not.toMatch(/<(?:script|link)[^>]+https?:\/\//i);
	});

	it("does not contain an advertising integration", () => {
		expect(html).not.toContain("googlesyndication.com");
		expect(html).not.toContain("adsbygoogle");
	});
});
