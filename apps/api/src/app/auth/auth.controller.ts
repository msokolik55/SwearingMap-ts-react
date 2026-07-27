import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiNoContentResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { RoleKey } from "../../generated/prisma/enums";
import { AuthService } from "./auth.service";
import type { AuthPrincipal } from "./auth.types";
import { CurrentUser } from "./current-user.decorator";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { CurrentUserDto } from "./dto/current-user.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { Public } from "./public.decorator";
import { Roles } from "./roles.decorator";

@ApiTags("Authentication")
@Controller({ path: "auth", version: "1" })
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Throttle({ default: { limit: 5, ttl: 60_000 } })
	@Post("register")
	@ApiOperation({ operationId: "register", summary: "Create an account" })
	@ApiCreatedResponse({ type: AuthResponseDto })
	@ApiConflictResponse({ description: "Email is already registered" })
	register(@Body() input: RegisterDto): Promise<AuthResponseDto> {
		return this.authService.register(input);
	}

	@Public()
	@Throttle({ default: { limit: 5, ttl: 60_000 } })
	@HttpCode(HttpStatus.OK)
	@Post("sign-in")
	@ApiOperation({ operationId: "signIn", summary: "Start a session" })
	@ApiOkResponse({ type: AuthResponseDto })
	@ApiUnauthorizedResponse({ description: "Invalid credentials" })
	signIn(@Body() input: SignInDto): Promise<AuthResponseDto> {
		return this.authService.signIn(input.email, input.password);
	}

	@Public()
	@Throttle({ default: { limit: 20, ttl: 60_000 } })
	@HttpCode(HttpStatus.OK)
	@Post("refresh")
	@ApiOperation({ operationId: "refreshSession", summary: "Rotate a session" })
	@ApiOkResponse({ type: AuthResponseDto })
	@ApiUnauthorizedResponse({ description: "Invalid or expired session" })
	refresh(@Body() input: RefreshTokenDto): Promise<AuthResponseDto> {
		return this.authService.refresh(input.refreshToken);
	}

	@Public()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Post("logout")
	@ApiOperation({ operationId: "logout", summary: "Revoke a session" })
	@ApiNoContentResponse()
	logout(@Body() input: RefreshTokenDto): Promise<void> {
		return this.authService.logout(input.refreshToken);
	}

	@Get("me")
	@Roles(RoleKey.USER)
	@ApiBearerAuth()
	@ApiOperation({ operationId: "getCurrentUser", summary: "Read token identity" })
	@ApiOkResponse({ type: CurrentUserDto })
	@ApiForbiddenResponse({ description: "The account does not have the required role" })
	@ApiUnauthorizedResponse()
	me(@CurrentUser() user: AuthPrincipal): CurrentUserDto {
		return user;
	}
}
