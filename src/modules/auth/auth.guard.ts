import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

import { IS_PUBLIC_KEY } from './decorators/public.decorator'

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector
    ) {}

    async canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        if (isPublic) {
            return true
        }

        const request = context.switchToHttp().getRequest<Request>()
        const accessToken = request.headers?.authorization?.replace(/bearer\s+/i, '')

        if (!accessToken) {
            throw new UnauthorizedException()
        }

        try {
            const { sub: id } = await this.jwtService.verifyAsync(accessToken)
            request['credentials'] = { id }
        } catch {
            throw new UnauthorizedException()
        }

        return true
    }
}
