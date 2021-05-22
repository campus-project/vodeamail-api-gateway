import { IsNotEmpty, IsUUID } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  @IsUUID('4')
  user_id: string;
}
