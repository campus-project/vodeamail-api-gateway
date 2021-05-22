import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GeneratedAccessTokenDto {
  @IsNotEmpty()
  @IsString()
  access_token: string;

  @IsNotEmpty()
  @IsNumber()
  expires_in: number;
}
