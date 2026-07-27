import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Public } from "../auth/public.decorator";
import { HealthResponseDto } from "./health-response.dto";
import { HealthService } from "./health.service";

@ApiTags("Health")
@Controller({ path: "health", version: "1" })
export class HealthController {
	constructor(private readonly healthService: HealthService) {}

	@Public()
	@Get()
	@ApiOperation({
		operationId: "getHealth",
		summary: "Check API availability",
	})
	@ApiOkResponse({ type: HealthResponseDto })
	getHealth(): HealthResponseDto {
		return this.healthService.getHealth();
	}
}
