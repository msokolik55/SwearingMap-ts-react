import { describe, expect, it } from "vitest";

import { HealthService } from "./health.service";

describe("HealthService", () => {
	it("returns a stable service health contract", () => {
		expect(new HealthService().getHealth()).toEqual({
			service: "swearing-map-api",
			status: "ok",
			version: "1.0.0",
		});
	});
});
