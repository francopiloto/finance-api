import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy } from 'passport-jwt';

import { UserService } from '@modules/user/user.service';

import { AuthStrategyName } from '../auth.constants';
import { jwtFromRequest } from '../token/token.utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AuthStrategyName.JWT) {
  constructor(
    readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate({ sub: userId, aud: device }: { sub: string; aud: string }) {
    const user = await this.userService.findOneById(userId);

    if (user) {
      return [user, { device }];
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
