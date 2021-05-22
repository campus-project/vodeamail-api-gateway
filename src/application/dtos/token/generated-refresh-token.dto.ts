import { IsNotEmpty, IsString } from 'class-validator';

export class GeneratedRefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
