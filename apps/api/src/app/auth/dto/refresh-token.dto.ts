import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class RefreshTokenDto {
	@ApiProperty({
		maxLength: 256,
		minLength: 43,
		type: String,
		writeOnly: true,
	})
	@IsString()
	@MaxLength(256)
	@MinLength(43)
	refreshToken!: string;
}
