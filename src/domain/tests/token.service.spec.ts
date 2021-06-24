import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from '../services/token.service';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { JwtModule } from '@nestjs/jwt';
import { DomainModule } from '../domain.module';
import { RefreshTokenService } from '../services/refresh-token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        InfrastructureModule,
        JwtModule.register({
          secret: '99!@#AA#@!99',
          signOptions: {
            expiresIn: '8h',
          },
        }),
        TypeOrmModule.forFeature([RefreshToken]),
      ],
      providers: [
        {
          provide: 'REFRESH_TOKEN_SERVICE',
          useClass: RefreshTokenService,
        },
        TokenService,
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
