import { Inject, Injectable } from "@nestjs/common";

import type { GeospatialRepository } from "./geospatial.repository";
import { GEOSPATIAL_REPOSITORY } from "./geospatial.repository";

@Injectable()
export class GeographyService {
	constructor(
		@Inject(GEOSPATIAL_REPOSITORY)
		private readonly geospatialRepository: GeospatialRepository
	) {}

	findCountriesNear(latitude: number, longitude: number, radiusMeters: number) {
		return this.geospatialRepository.findCountriesNear(
			{ latitude, longitude },
			radiusMeters
		);
	}
}
