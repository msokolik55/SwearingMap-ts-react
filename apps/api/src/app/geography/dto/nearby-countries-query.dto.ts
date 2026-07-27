import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, Max, Min } from "class-validator";

export class NearbyCountriesQueryDto {
	@ApiProperty({ example: 48.1486, maximum: 90, minimum: -90, type: Number })
	@Type(() => Number)
	@IsNumber()
	@Max(90)
	@Min(-90)
	latitude!: number;

	@ApiProperty({ example: 17.1077, maximum: 180, minimum: -180, type: Number })
	@Type(() => Number)
	@IsNumber()
	@Max(180)
	@Min(-180)
	longitude!: number;

	@ApiPropertyOptional({
		default: 100_000,
		example: 50_000,
		maximum: 5_000_000,
		minimum: 1,
		type: Number,
	})
	@Type(() => Number)
	@IsNumber()
	@Max(5_000_000)
	@Min(1)
	radiusMeters = 100_000;
}
