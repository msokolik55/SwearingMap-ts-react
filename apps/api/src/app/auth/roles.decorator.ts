import { SetMetadata } from "@nestjs/common";

import type { RoleKey } from "../../generated/prisma/enums";

export const REQUIRED_ROLES_KEY = "auth:required-roles";
export const Roles = (...roles: RoleKey[]): MethodDecorator & ClassDecorator =>
	SetMetadata(REQUIRED_ROLES_KEY, roles);
