import { ApiProperty } from "@nestjs/swagger";

export class HealthResponseDto {
	@ApiProperty({ enum: ["ok"], example: "ok", type: String })
	status!: "ok";

	@ApiProperty({
		enum: ["swearing-map-api"],
		example: "swearing-map-api",
		type: String,
	})
	service!: "swearing-map-api";

	@ApiProperty({ example: "1.0.0", type: String })
	version!: string;
}
