import { describe, expect, it } from "vitest";

import html from "../../index.html?raw";

describe("third-party content baseline", () => {
	it("does not load remote scripts or styles before user consent", () => {
		expect(html).not.toMatch(/<(?:script|link)[^>]+https?:\/\//i);
	});

	it("does not contain an advertising integration", () => {
		expect(html).not.toContain("googlesyndication.com");
		expect(html).not.toContain("adsbygoogle");
	});
});
