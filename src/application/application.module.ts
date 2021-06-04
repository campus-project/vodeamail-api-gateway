import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';

import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { DomainModule } from '../domain/domain.module';
import { RoleController } from './controllers/gateway/role.controller';
import { UserController } from './controllers/gateway/user.controller';
import { AuthController } from './controllers/gateway/auth.controller';
import { AccountController } from './controllers/gateway/account.controller';
import { ConfigModule } from '@nestjs/config';
import { ContactController } from './controllers/gateway/contact.controller';
import { GroupController } from './controllers/gateway/group.controller';
import { EmailTemplateController } from './controllers/gateway/email-template.controller';
import { EmailCampaignController } from './controllers/gateway/email-campaign.controller';
import { EmailAnalyticController } from './controllers/gateway/email-analytic.controller';
import { TransactionController } from './controllers/transaction.controller';
import { PermissionController } from './controllers/permission.controller';
import { GateSettingController } from './controllers/gate-setting.controller';
import { RoleExistsRule } from './rules/role-exists.rule';
import { PermissionExistsRule } from './rules/permission-exists.rule';

@Module({
  imports: [ConfigModule.forRoot(), InfrastructureModule, DomainModule],
  controllers: [
    RoleController,
    UserController,
    AuthController,
    AccountController,
    ContactController,
    GroupController,
    EmailTemplateController,
    EmailCampaignController,
    EmailAnalyticController,
    TransactionController,
    PermissionController,
    GateSettingController,
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthStrategy,
    },
    PermissionExistsRule,
    RoleExistsRule,
  ],
  exports: [InfrastructureModule, DomainModule],
})
export class ApplicationModule {}
