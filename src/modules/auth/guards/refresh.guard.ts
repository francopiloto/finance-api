import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { AuthStrategyType } from '../auth.constants'

@Injectable()
export class RefreshGuard extends AuthGuard(AuthStrategyType.REFRESH) {}
