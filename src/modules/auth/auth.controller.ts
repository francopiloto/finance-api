import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBadRequestResponse, ApiConflictResponse } from '@nestjs/swagger'

import { CreateUserDto } from '@modules/user/dtos/create-user.dto'

import { AuthService } from './auth.service'
import { Public } from './decorators/public.decorator'
import { SignInUserDto } from './dtos/signin-user.dto'

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    @Public()
    @ApiConflictResponse({ description: 'Email already in use' })
    signUp(@Body() body: CreateUserDto) {
        return this.authService.signUp(body)
    }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    @Public()
    @ApiBadRequestResponse({ description: 'Invalid credentials' })
    signIn(@Body() body: SignInUserDto) {
        return this.authService.signIn(body)
    }
}
