import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Permission } from '../../domain/entities/permission.entity';
import { GateSetting } from '../../domain/entities/gate-setting.entity';
import { GateSettingPermission } from '../../domain/entities/gate-setting-permission.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: true,
        dropSchema: false,
        logging: false,
        entities: [
          RefreshToken,
          Transaction,
          Permission,
          GateSetting,
          GateSettingPermission,
        ],
        timezone: 'UTC',
      }),
    }),
  ],
})
export class DatabaseModule {}
