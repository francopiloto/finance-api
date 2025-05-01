import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthStrategyName } from '../auth.constants';

@Injectable()
export class RefreshGuard extends AuthGuard(AuthStrategyName.REFRESH) {}
