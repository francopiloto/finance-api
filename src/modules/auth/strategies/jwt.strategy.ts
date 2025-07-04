import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { AuthStrategyName } from '../auth.enums';
import { AuthAccount } from '../entities/auth-account.entity';
import { jwtFromRequest } from '../token/token.utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AuthStrategyName.JWT) {
  constructor(
    readonly configService: ConfigService,
    private readonly accountRepo: Repository<AuthAccount>,
  ) {
    super({
      jwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate({ sub: accountId, aud: device }: { sub: string; aud: string }) {
    const account = await this.accountRepo.findOne({
      where: { id: accountId },
      relations: ['user'],
    });

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return [account.user ?? null, { account, device }];
  }
}
