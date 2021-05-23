import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';

import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { DomainModule } from '../domain/domain.module';
import { OrganizationController } from './controllers/gateway/organization.controller';
import { RoleController } from './controllers/gateway/role.controller';
import { UserController } from './controllers/gateway/user.controller';
import { AuthController } from './controllers/gateway/auth.controller';
import { AccountController } from './controllers/gateway/account.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), InfrastructureModule, DomainModule],
  controllers: [
    OrganizationController,
    RoleController,
    UserController,
    AuthController,
    AccountController,
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthStrategy,
    },
  ],
  exports: [InfrastructureModule, DomainModule],
})
export class ApplicationModule {}
