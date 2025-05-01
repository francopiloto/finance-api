import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { DISABLE_DEFAULT_AUTH_GUARD_KEY } from '../auth.constants';
import { RefreshGuard } from '../guards/refresh.guard';

export function AuthStrategyRefresh() {
  return applyDecorators(
    SetMetadata(DISABLE_DEFAULT_AUTH_GUARD_KEY, true),
    UseGuards(RefreshGuard),
    ApiUnauthorizedResponse({ description: 'Invalid refresh token' }),
    ApiBearerAuth(),
  );
}
