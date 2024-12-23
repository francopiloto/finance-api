import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { UserModule } from '@modules/user/user.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { DefaultAuthGuard } from './guards/default.guard'
import { JwtStrategy } from './strategies/jwt.strategy'

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
        UserModule,
    ],
    providers: [AuthService, JwtStrategy, { provide: APP_GUARD, useClass: DefaultAuthGuard }],
    controllers: [AuthController],
})
export class AuthModule {}
