import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthStrategyName } from '../auth.constants';

@Injectable()
export class JwtRefreshGuard extends AuthGuard(AuthStrategyName.REFRESH_JWT) {}
