import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Request } from 'express';
import { Profile, Strategy } from 'passport-google-oauth20';

import { AuthProvider } from '../auth.enums';
import { OAuthProfile } from '../types/oauth';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, AuthProvider.GOOGLE) {
  constructor(config: ConfigService) {
    super({
      clientID: config.get('oauth.google.clientId'),
      clientSecret: config.get('oauth.google.clientSecret'),
      callbackURL: config.get('oauth.google.callbackUrl'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: any, user?: OAuthProfile | false, info?: any) => void,
  ): void {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      return done(new Error('Email not available from Google profile'), false);
    }

    const device = (req.query.state as string) ?? 'default';

    const user = {
      provider: AuthProvider.GOOGLE,
      providerUserId: profile.id,
      email,
      avatarUrl: profile.photos?.[0]?.value,
    };

    return done(null, user, { device });
  }
}
