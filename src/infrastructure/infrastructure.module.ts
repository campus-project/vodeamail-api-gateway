import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { DatabaseModule } from './database/database.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

const providers: Provider[] = [
  {
    provide: 'ACCOUNT_SERVICE',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) =>
      ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: configService.get<string>('ACCOUNT_SERVICE_HOST'),
          port: configService.get<number>('ACCOUNT_SERVICE_PORT'),
        },
      }),
  },
  {
    provide: 'AUDIENCE_SERVICE',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) =>
      ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: configService.get<string>('AUDIENCE_SERVICE_HOST'),
          port: configService.get<number>('AUDIENCE_SERVICE_PORT'),
        },
      }),
  },
  {
    provide: 'CAMPAIGN_SERVICE',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) =>
      ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: configService.get<string>('CAMPAIGN_SERVICE_HOST'),
          port: configService.get<number>('CAMPAIGN_SERVICE_PORT'),
        },
      }),
  },
];

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
  providers: [...providers],
  exports: [...providers],
})
export class InfrastructureModule {}
