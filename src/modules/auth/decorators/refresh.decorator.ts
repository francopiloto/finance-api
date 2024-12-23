import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'

import { DISABLE_DEFAULT_AUTH_GUARD_KEY } from '../auth.constants'
import { RefreshGuard } from '../guards/refresh.guard'

export function AuthStrategyRefresh() {
    return applyDecorators(SetMetadata(DISABLE_DEFAULT_AUTH_GUARD_KEY, true), UseGuards(RefreshGuard))
}
