import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRefreshTokenDto {
  @IsNotEmpty()
  @IsUUID('4')
  user_id: string;

  @IsNotEmpty()
  @IsDateString()
  expired_at: string;
}
