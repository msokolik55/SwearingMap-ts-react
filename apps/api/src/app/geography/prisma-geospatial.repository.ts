import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../database/prisma.service";
import type {
	GeoPoint,
	GeospatialRepository,
	NearbyCountry,
} from "./geospatial.repository";

type GeospatialDatabaseClient = Pick<PrismaService, "$queryRaw">;

@Injectable()
export class PrismaGeospatialRepository implements GeospatialRepository {
	constructor(
		@Inject(PrismaService) private readonly prisma: GeospatialDatabaseClient
	) {}

	findCountriesNear(point: GeoPoint, radiusMeters: number): Promise<NearbyCountry[]> {
		return this.prisma.$queryRaw<NearbyCountry[]>`
			SELECT
				"id",
				"name",
				"slug",
				ST_Distance(
					"map_center",
					ST_SetSRID(ST_MakePoint(${point.longitude}, ${point.latitude}), 4326)::geography
				)::double precision AS "distanceMeters"
			FROM "countries"
			WHERE
				"map_center" IS NOT NULL
				AND ST_DWithin(
					"map_center",
					ST_SetSRID(ST_MakePoint(${point.longitude}, ${point.latitude}), 4326)::geography,
					${radiusMeters}
				)
			ORDER BY "distanceMeters" ASC, "id" ASC
		`;
	}
}
