import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateRefreshTokenDto {
  @IsNotEmpty()
  @IsUUID('4')
  user_id: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  ttl: number;
}
