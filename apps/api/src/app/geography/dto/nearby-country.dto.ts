import { ApiProperty } from "@nestjs/swagger";

export class NearbyCountryDto {
	@ApiProperty({ example: 0, type: Number })
	distanceMeters!: number;

	@ApiProperty({ format: "uuid", type: String })
	id!: string;

	@ApiProperty({ example: "Slovakia", type: String })
	name!: string;

	@ApiProperty({ example: "slovakia", type: String })
	slug!: string;
}
