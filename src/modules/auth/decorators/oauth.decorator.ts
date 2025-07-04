import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOAuth2 } from '@nestjs/swagger';

import { DISABLE_DEFAULT_AUTH_GUARD_KEY } from '../auth.constants';
import { AuthProvider } from '../auth.enums';

export function OAuthGuard(provider: AuthProvider) {
  return applyDecorators(
    SetMetadata(DISABLE_DEFAULT_AUTH_GUARD_KEY, true),
    UseGuards(AuthGuard(provider)),
    ApiOAuth2([provider], `OAuth login via ${provider}`),
  );
}
