import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { createHash } from 'crypto';

import { addDays } from 'date-fns';

import { AuthAccount } from '../entities/auth-account.entity';

@Injectable()
export class TokenFactory {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(account: AuthAccount, device: string) {
    const payload = {
      sub: account.id,
      aud: device,
      userId: account.user?.id ?? null,
      onboardingStep: account.user?.onboardingStep ?? null,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: this.configService.get('jwt.expiresIn') }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      }),
    ]);

    const tokenRecord = {
      account,
      device,
      refreshTokenHash: this.hashToken(refreshToken),
      expiresAt: addDays(new Date(), 7),
    };

    return { accessToken, refreshToken, tokenRecord };
  }

  hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
