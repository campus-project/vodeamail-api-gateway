import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { clientRpcException } from '../../../@core/helpers/exception-rpc.helper';
import { TokenService } from '../../../domain/services/token.service';
import { Public } from '../../../@core/decorators/is-public.decorator';

@Public()
@Controller('v1/auth')
export class AuthController {
  constructor(
    @Inject('ACCOUNT_SERVICE')
    private readonly accountService: ClientProxy,
    @Inject('JWT_SERVICE')
    private readonly jwtService: TokenService,
  ) {}

  @Post('login')
  async login(@Body() authLoginDto) {
    return await this.jwtService.createAccessTokenAndRefreshToken(authLoginDto);
  }

  @Post('refresh-token')
  async refreshToken(@Body() authRefreshTokenDto) {
    return await this.jwtService.createAccessTokenFromRefreshToken(
      authRefreshTokenDto,
    );
  }

  @Post('register')
  async register(@Body() authRegisterDto) {
    const data = await this.accountService
      .send('authRegister', authRegisterDto)
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() authForgotPasswordDto) {
    const data = await this.accountService
      .send('authForgotPassword', authForgotPasswordDto)
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Post('reset-password')
  async resetPassword(@Body() authResetPasswordDto) {
    const data = await this.accountService
      .send('authResetPassword', authResetPasswordDto)
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }
}
