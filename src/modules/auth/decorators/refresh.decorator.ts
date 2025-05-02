import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { DISABLE_DEFAULT_AUTH_GUARD_KEY } from '../auth.constants';
import { JwtRefreshGuard } from '../guards/refresh.guard';

export function AuthRefreshGuard() {
  return applyDecorators(
    SetMetadata(DISABLE_DEFAULT_AUTH_GUARD_KEY, true),
    UseGuards(JwtRefreshGuard),
    ApiUnauthorizedResponse({ description: 'Invalid refresh token' }),
    ApiBearerAuth(),
  );
}
