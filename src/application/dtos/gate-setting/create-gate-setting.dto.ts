import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
} from 'class-validator';
import { RoleExistsRule } from '../../rules/role-exists.rule';
import { PermissionExistsRule } from '../../rules/permission-exists.rule';

export class CreateGateSettingDto {
  @IsOptional()
  @IsUUID('4')
  organization_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsDateString()
  valid_from: string;

  @IsNotEmpty()
  @IsUUID('4')
  @Validate(RoleExistsRule)
  role_id: string;

  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  @Validate(PermissionExistsRule, { each: true })
  permission_ids: string[];

  @IsOptional()
  @IsUUID('4')
  actor?: string;
}
