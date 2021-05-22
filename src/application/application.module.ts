import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { DomainModule } from '../domain/domain.module';
import { OrganizationController } from './controllers/gateway/organization.controller';
import { RoleController } from './controllers/gateway/role.controller';
import { UserController } from './controllers/gateway/user.controller';
import { AuthController } from './controllers/gateway/auth.controller';

@Module({
  imports: [InfrastructureModule, DomainModule],
  controllers: [
    OrganizationController,
    RoleController,
    UserController,
    AuthController,
  ],
  providers: [],
  exports: [InfrastructureModule, DomainModule],
})
export class ApplicationModule {}
