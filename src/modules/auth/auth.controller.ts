import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthProvider } from './auth.enums';
import { AuthService } from './auth.service';
import {
  AuthRefreshGuard,
  CurrentAuthAccount,
  CurrentAuthInfo,
  CurrentOAuthProfile,
  CurrentUser,
  OAuthGuard,
  Public,
} from './decorators';
import { LoginLocalDto } from './dtos/login-local.dto';
import { RegisterLocalDto } from './dtos/register-local.dto';
import { AuthAccount } from './entities/auth-account.entity';
import { OAuthProfile } from './types/oauth';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiConflictResponse({ description: 'Email already in use' })
  signup(@Body() data: RegisterLocalDto) {
    return this.authService.registerLocal(data);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({ summary: 'Authenticate a user and return access/refresh tokens' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  signin(@Body() data: LoginLocalDto) {
    return this.authService.loginLocal(data);
  }

  @Post('signout')
  @ApiOperation({ summary: 'Revoke refresh token for the authenticated device' })
  async signout(@CurrentUser('id') id: string, @CurrentAuthInfo('device') device: string) {
    return this.authService.signout(id, device);
  }

  @Post('refresh')
  @AuthRefreshGuard()
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  refresh(@CurrentAuthAccount() account: AuthAccount, @CurrentAuthInfo('device') device: string) {
    return this.authService.generateTokens(account, device);
  }

  @OAuthGuard(AuthProvider.GOOGLE)
  @Get('oauth/google')
  async googleAuth() {
    // automatically redirects through Passport
  }

  @OAuthGuard(AuthProvider.GOOGLE)
  @Get('oauth/google/callback')
  googleCallback(
    @CurrentOAuthProfile() profile: OAuthProfile,
    @CurrentAuthInfo('device') device: string,
  ) {
    return this.authService.loginOAuth(profile, device);
  }
}
