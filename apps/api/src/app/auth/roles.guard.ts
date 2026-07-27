import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import type { AuthPrincipal } from "./auth.types";
import { REQUIRED_ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles =
			this.reflector.getAllAndOverride<AuthPrincipal["roles"]>(REQUIRED_ROLES_KEY, [
				context.getHandler(),
				context.getClass(),
			]) ?? [];
		if (requiredRoles.length === 0) return true;

		const request = context.switchToHttp().getRequest<{ user?: AuthPrincipal }>();

		return requiredRoles.some((role) => request.user?.roles.includes(role));
	}
}
