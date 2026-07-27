import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Public } from "../auth/public.decorator";
import { NearbyCountriesQueryDto } from "./dto/nearby-countries-query.dto";
import { NearbyCountryDto } from "./dto/nearby-country.dto";
import { GeographyService } from "./geography.service";

@ApiTags("Geography")
@Controller({ path: "countries", version: "1" })
export class GeographyController {
	constructor(private readonly geographyService: GeographyService) {}

	@Public()
	@Get("nearby")
	@ApiOperation({
		operationId: "findNearbyCountries",
		summary: "Find countries near a geographic point",
	})
	@ApiOkResponse({ isArray: true, type: NearbyCountryDto })
	findNearby(@Query() query: NearbyCountriesQueryDto): Promise<NearbyCountryDto[]> {
		return this.geographyService.findCountriesNear(
			query.latitude,
			query.longitude,
			query.radiusMeters
		);
	}
}
