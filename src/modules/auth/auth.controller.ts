import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiUnauthorizedResponse } from '@nestjs/swagger'

import { User } from '@modules/user/entities/user.entity'

import { AuthService } from './auth.service'
import { AuthInfo } from './decorators/info.decorator'
import { Public } from './decorators/public.decorator'
import { AuthStrategyRefresh } from './decorators/refresh.decorator'
import { CurrentUser } from './decorators/user.decorator'
import { SignInUserDto } from './dtos/signin-user.dto'
import { SignUpUserDto } from './dtos/signup-user.dto'

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    @Public()
    @ApiConflictResponse({ description: 'Email already in use' })
    signUp(@Body() data: SignUpUserDto) {
        return this.authService.signUp(data)
    }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    @Public()
    @ApiBadRequestResponse({ description: 'Invalid credentials' })
    signIn(@Body() data: SignInUserDto) {
        return this.authService.signIn(data)
    }

    @Get('refresh')
    @HttpCode(HttpStatus.OK)
    @AuthStrategyRefresh()
    @ApiUnauthorizedResponse()
    @ApiBearerAuth()
    refreshToken(@CurrentUser() user: User, @AuthInfo('appId') appId: string) {
        return this.authService.createTokens(user, appId)
    }
}
