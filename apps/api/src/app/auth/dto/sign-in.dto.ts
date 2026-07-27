import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class SignInDto {
	@ApiProperty({ example: "learner@example.com", maxLength: 320, type: String })
	@IsEmail()
	@MaxLength(320)
	email!: string;

	@ApiProperty({ maxLength: 128, type: String, writeOnly: true })
	@IsString()
	@MaxLength(128)
	@MinLength(1)
	password!: string;
}
