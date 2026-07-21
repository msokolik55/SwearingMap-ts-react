import { describe, expect, it, vi } from "vitest";

import { BORDER_DATA_URL, loadBorders } from "./useBorders";

const borderCollection = {
	type: "FeatureCollection",
	features: [
		{
			type: "Feature",
			properties: { ADMIN: "Czech Republic", ISO_A3: "CZE" },
			geometry: { type: "Polygon", coordinates: [[[15, 49]]] },
		},
	],
};

describe("loadBorders", () => {
	it("loads and validates the static country dataset", async () => {
		const request = vi.fn().mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue(borderCollection),
		});

		await expect(loadBorders(undefined, request)).resolves.toEqual(
			borderCollection.features
		);
		expect(request).toHaveBeenCalledWith(BORDER_DATA_URL, { signal: undefined });
	});

	it("rejects unsuccessful responses", async () => {
		const request = vi.fn().mockResolvedValue({ ok: false, status: 503 });

		await expect(loadBorders(undefined, request)).rejects.toThrow(
			"Country data request failed with status 503."
		);
	});

	it("rejects an unsupported payload", async () => {
		const request = vi.fn().mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({ features: "invalid" }),
		});

		await expect(loadBorders(undefined, request)).rejects.toThrow(
			"Country data has an unsupported format."
		);
	});
});
