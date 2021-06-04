import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { RefreshTokenService } from './services/refresh-token.service';
import { TransactionService } from './services/transaction.service';
import { PermissionService } from './services/permission.service';
import { GateSettingService } from './services/gate-setting.service';

import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { TokenService } from './services/token.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { Transaction } from './entities/transaction.entity';
import { Permission } from './entities/permission.entity';
import { GateSetting } from './entities/gate-setting.entity';
import { GateSettingPermission } from './entities/gate-setting-permission.entity';

const providers: Provider[] = [
  {
    provide: 'JWT_SERVICE',
    useClass: TokenService,
  },
  {
    provide: 'REFRESH_TOKEN_SERVICE',
    useClass: RefreshTokenService,
  },
  {
    provide: 'TRANSACTION_SERVICE',
    useClass: TransactionService,
  },
  {
    provide: 'PERMISSION_SERVICE',
    useClass: PermissionService,
  },
  {
    provide: 'GATE_SETTING_SERVICE',
    useClass: GateSettingService,
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
    TypeOrmModule.forFeature([
      RefreshToken,
      Transaction,
      Permission,
      GateSetting,
      GateSettingPermission,
    ]),
  ],
  providers: [...providers],
  exports: [...providers],
})
export class DomainModule {}
