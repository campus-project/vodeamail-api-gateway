import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class DeleteGateSettingDto {
  @IsOptional()
  @IsUUID('4')
  organization_id: string;

  @IsOptional()
  @IsUUID('4')
  id: string;

  @IsOptional()
  @IsBoolean()
  is_hard?: boolean;

  @IsOptional()
  @IsUUID('4')
  actor?: string;
}
