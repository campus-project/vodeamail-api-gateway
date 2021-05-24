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
