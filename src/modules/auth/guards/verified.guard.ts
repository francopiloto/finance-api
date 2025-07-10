import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import { AuthAccount } from '../entities/auth-account.entity';

@Injectable()
export class VerifiedAccountGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const account: AuthAccount = req.authInfo?.account;

    if (!account?.verified) {
      throw new ForbiddenException('Account is not verified');
    }

    return true;
  }
}
