import { describe, expect, it, vi } from "vitest";

import { createClient, getHealth } from "./index";

describe("generated API client", () => {
	it("calls the versioned health endpoint with a typed response", async () => {
		const requestedUrls: string[] = [];
		const fetch = vi.fn(async (input: RequestInfo | URL) => {
			requestedUrls.push(input instanceof Request ? input.url : input.toString());
			return Response.json({
				service: "swearing-map-api",
				status: "ok",
				version: "1.0.0",
			});
		});
		const client = createClient({
			baseUrl: "https://api.example.test",
			fetch,
		});

		const result = await getHealth({ client });

		expect(fetch).toHaveBeenCalledOnce();
		expect(requestedUrls).toEqual(["https://api.example.test/api/v1/health"]);
		expect(result.data).toEqual({
			service: "swearing-map-api",
			status: "ok",
			version: "1.0.0",
		});
	});
});
