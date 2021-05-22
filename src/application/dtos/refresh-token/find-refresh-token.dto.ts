import { IsNotEmpty, IsUUID } from 'class-validator';

export class FindRefreshTokenDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}
