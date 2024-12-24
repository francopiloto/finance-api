import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'

import { AuthStrategyName, DISABLE_DEFAULT_AUTH_GUARD_KEY } from '../auth.constants'

@Injectable()
export class DefaultAuthGuard extends AuthGuard([AuthStrategyName.JWT]) {
    constructor(private readonly reflector: Reflector) {
        super()
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isDisabled = !!this.reflector.getAllAndOverride<boolean>(DISABLE_DEFAULT_AUTH_GUARD_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        return isDisabled || super.canActivate(context)
    }
}
