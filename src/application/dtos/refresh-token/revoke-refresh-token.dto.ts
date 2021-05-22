import { IsNotEmpty, IsUUID } from 'class-validator';

export class RevokeRefreshTokenDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}
