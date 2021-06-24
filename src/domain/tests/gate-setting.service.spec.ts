import { Test, TestingModule } from '@nestjs/testing';
import { GateSettingService } from '../services/gate-setting.service';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GateSetting } from '../entities/gate-setting.entity';
import { GateSettingPermission } from '../entities/gate-setting-permission.entity';
import { Permission } from '../entities/permission.entity';

describe('GateSettingService', () => {
  let service: GateSettingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        InfrastructureModule,
        TypeOrmModule.forFeature([
          GateSetting,
          GateSettingPermission,
          Permission,
        ]),
      ],
      providers: [GateSettingService],
    }).compile();

    service = module.get<GateSettingService>(GateSettingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
