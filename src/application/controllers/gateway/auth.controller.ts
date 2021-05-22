import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { clientRpcException } from '../../../@core/helpers/exception-rpc.helper';

@Controller('v1/auth')
export class AuthController {
  constructor(
    @Inject('CLIENT_KAFKA')
    private readonly clientKafka: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = [
      'authLogin',
      'authRegister',
      'authForgotPassword',
      'authResetPassword',
    ];

    for (const pattern of patterns) {
      this.clientKafka.subscribeToResponseOf(pattern);
    }
  }

  @Post('login')
  async login(@Body() authLoginDto) {
    const data = await this.clientKafka
      .send('authLogin', authLoginDto)
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Post('register')
  async register(@Body() authRegisterDto) {
    const data = await this.clientKafka
      .send('authRegister', authRegisterDto)
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() authForgotPasswordDto) {
    const data = await this.clientKafka
      .send('authForgotPassword', authForgotPasswordDto)
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Post('reset-password')
  async resetPassword(@Body() authResetPasswordDto) {
    const data = await this.clientKafka
      .send('authResetPassword', authResetPasswordDto)
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }
}
