import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
	@ApiProperty({ example: "learner@example.com", maxLength: 320, type: String })
	@IsEmail()
	@MaxLength(320)
	email!: string;

	@ApiPropertyOptional({
		example: "Curious Learner",
		maxLength: 120,
		type: String,
	})
	@IsOptional()
	@IsString()
	@MaxLength(120)
	@MinLength(1)
	displayName?: string;

	@ApiProperty({
		maxLength: 128,
		minLength: 12,
		type: String,
		writeOnly: true,
	})
	@IsString()
	@MaxLength(128)
	@MinLength(12)
	password!: string;
}
