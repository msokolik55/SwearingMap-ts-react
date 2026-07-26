import { Injectable } from "@nestjs/common";

import type { HealthResponseDto } from "./health-response.dto";

@Injectable()
export class HealthService {
	getHealth(): HealthResponseDto {
		return {
			service: "swearing-map-api",
			status: "ok",
			version: "1.0.0",
		};
	}
}
