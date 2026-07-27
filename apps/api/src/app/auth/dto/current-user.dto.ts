import { ApiProperty } from "@nestjs/swagger";

import { RoleKey } from "../../../generated/prisma/enums";

export class CurrentUserDto {
	@ApiProperty({ example: "learner@example.com", type: String })
	email!: string;

	@ApiProperty({ enum: RoleKey, isArray: true, type: String })
	roles!: RoleKey[];

	@ApiProperty({ format: "uuid", type: String })
	sub!: string;
}
