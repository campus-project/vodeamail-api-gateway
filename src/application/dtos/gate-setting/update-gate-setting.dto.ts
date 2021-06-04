import { CreateGateSettingDto } from './create-gate-setting.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateGateSettingDto extends CreateGateSettingDto {
  @IsOptional()
  @IsUUID('4')
  id: string;
}
