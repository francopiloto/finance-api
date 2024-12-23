import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'

import { UserModule } from '@modules/user/user.module'

import { AuthController } from './auth.controller'
import { AuthGuard } from './auth.guard'
import { AuthService } from './auth.service'

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get('jwt.secret'),
                signOptions: { expiresIn: config.get('jwt.expiresIn') },
            }),
        }),
        UserModule,
    ],
    providers: [AuthService, { provide: APP_GUARD, useClass: AuthGuard }],
    controllers: [AuthController],
})
export class AuthModule {}
