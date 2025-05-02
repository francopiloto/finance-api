import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { User } from '@modules/user/entities/user.entity';

import { AuthService } from './auth.service';
import { AuthInfo, AuthRefreshGuard, CurrentUser, Public } from './decorators';
import { SignInUserDto } from './dtos/signin-user.dto';
import { SignUpUserDto } from './dtos/signup-user.dto';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiConflictResponse({ description: 'Email already in use' })
  signup(@Body() data: SignUpUserDto) {
    return this.authService.signup(data);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({ summary: 'Authenticate a user and return access/refresh tokens' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  signin(@Body() data: SignInUserDto) {
    return this.authService.signin(data);
  }

  @Post('signout')
  @ApiOperation({ summary: 'Revoke refresh token for the authenticated device' })
  async signout(@CurrentUser('id') id: string, @AuthInfo('device') device: string) {
    return this.authService.signout(id, device);
  }

  @Post('refresh')
  @AuthRefreshGuard()
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  refresh(@CurrentUser() user: User, @AuthInfo('device') device: string) {
    return this.authService.generateTokens(user, device);
  }
}
