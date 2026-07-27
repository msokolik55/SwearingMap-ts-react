import { Module } from "@nestjs/common";

import { GeographyController } from "./geography.controller";
import { GeographyService } from "./geography.service";
import { GEOSPATIAL_REPOSITORY } from "./geospatial.repository";
import { PrismaGeospatialRepository } from "./prisma-geospatial.repository";

@Module({
	controllers: [GeographyController],
	providers: [
		GeographyService,
		{
			provide: GEOSPATIAL_REPOSITORY,
			useClass: PrismaGeospatialRepository,
		},
	],
})
export class GeographyModule {}
