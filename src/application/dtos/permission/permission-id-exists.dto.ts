import { IsNotEmpty, IsUUID } from 'class-validator';

export class PermissionIdExistsDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}
