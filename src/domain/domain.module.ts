import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { RefreshTokenService } from './services/refresh-token.service';
import { RefreshToken } from './entities/refresh-token.entity';

const providers: Provider[] = [
  {
    provide: 'REFRESH_TOKEN_SERVICE',
    useClass: RefreshTokenService,
  },
];

@Module({
  imports: [InfrastructureModule, TypeOrmModule.forFeature([RefreshToken])],
  providers: [...providers],
  exports: [...providers],
})
export class DomainModule {}
