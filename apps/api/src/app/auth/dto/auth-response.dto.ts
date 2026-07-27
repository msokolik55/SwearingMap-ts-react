import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { RoleKey } from "../../../generated/prisma/enums";

class AuthUserDto {
	@ApiPropertyOptional({
		example: "Curious Learner",
		nullable: true,
		type: String,
	})
	displayName!: string | null;

	@ApiProperty({ example: "learner@example.com", type: String })
	email!: string;

	@ApiProperty({ format: "uuid", type: String })
	id!: string;

	@ApiProperty({ enum: RoleKey, isArray: true, type: String })
	roles!: RoleKey[];
}

export class AuthResponseDto {
	@ApiProperty({ description: "Bearer access token", type: String })
	accessToken!: string;

	@ApiProperty({ example: 900, type: Number })
	expiresIn!: number;

	@ApiProperty({
		description: "Single-use opaque token rotated by the refresh endpoint",
		type: String,
	})
	refreshToken!: string;

	@ApiProperty({ type: () => AuthUserDto })
	user!: AuthUserDto;
}

export class CurrentUserDto {
	@ApiProperty({ example: "learner@example.com", type: String })
	email!: string;

	@ApiProperty({ enum: RoleKey, isArray: true, type: String })
	roles!: RoleKey[];

	@ApiProperty({ format: "uuid", type: String })
	sub!: string;
}
