import { describe, expect, it } from "vitest";

import { reverseCoords, reversePosition } from "./util";

describe("coordinate utilities", () => {
	it("converts GeoJSON longitude/latitude to Leaflet latitude/longitude", () => {
		expect(reversePosition([17.1077, 48.1486])).toEqual([48.1486, 17.1077]);
	});

	it("converts a list of GeoJSON positions", () => {
		expect(
			reverseCoords([
				[17.1077, 48.1486],
				[16.3738, 48.2082],
			])
		).toEqual([
			[48.1486, 17.1077],
			[48.2082, 16.3738],
		]);
	});
});
