import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { Strategy } from 'passport-jwt'

import { UserService } from '@modules/user/user.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly userService: UserService,
        configService: ConfigService
    ) {
        super({
            jwtFromRequest: (req: Request) => req.headers?.authorization?.replace(/bearer\s+/i, ''),
            ignoreExpiration: false,
            secretOrKey: configService.get('jwt.secret'),
        })
    }

    async validate(payload: any) {
        const user = await this.userService.findOne(payload.sub)

        if (!user) {
            throw new UnauthorizedException()
        }

        return user
    }
}
