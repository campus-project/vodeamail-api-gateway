import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateRefreshTokenDto {
  @IsNotEmpty()
  @IsUUID('4')
  user_id: string;

  @IsNotEmpty()
  @IsString()
  @IsDate()
  expired_at: string;
}
