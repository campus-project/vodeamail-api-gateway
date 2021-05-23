import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { RefreshTokenService } from './services/refresh-token.service';
import { TokenService } from './services/token.service';
import { RefreshToken } from './entities/refresh-token.entity';

const providers: Provider[] = [
  {
    provide: 'JWT_SERVICE',
    useClass: TokenService,
  },
  {
    provide: 'REFRESH_TOKEN_SERVICE',
    useClass: RefreshTokenService,
  },
];

@Module({
  imports: [
    PassportModule,
    NestJwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || '99!@#AA#@!99',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '8h',
        },
      }),
    }),
    InfrastructureModule,
    TypeOrmModule.forFeature([RefreshToken]),
  ],
  providers: [...providers],
  exports: [...providers],
})
export class DomainModule {}
