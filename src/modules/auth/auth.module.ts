import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthAccount } from './entities/auth-account.entity';
import { AuthToken } from './entities/token.entity';
import { DefaultAuthGuard } from './guards/default.guard';
import { RefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenFactory } from './token/token.factory';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: { expiresIn: config.get('jwt.expiresIn') },
      }),
    }),
    TypeOrmModule.forFeature([AuthToken, AuthAccount]),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    TokenFactory,
    { provide: APP_GUARD, useClass: DefaultAuthGuard },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
