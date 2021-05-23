import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { User } from '../../../@core/decorators/user.decorator';
import { clientRpcException } from '../../../@core/helpers/exception-rpc.helper';
import { Public } from '../../../@core/decorators/is-public.decorator';
import { Gate } from '../../../@core/decorators/gate.decorator';

@Controller('v1/account')
export class AccountController {
  constructor(
    @Inject('CLIENT_KAFKA')
    private readonly clientKafka: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = ['getAccount', 'updateAccount', 'changePasswordAccount'];
    for (const pattern of patterns) {
      this.clientKafka.subscribeToResponseOf(pattern);
    }
  }

  @Get()
  async getAccount(@User() user) {
    return { data: user };
  }

  @Gate('permission')
  @Post()
  async updateAccount(@User('id') userId, @Body() updateAccountDto) {
    const data = await this.clientKafka
      .send('updateAccount', { ...updateAccountDto, id: userId })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Post('change-password')
  async changePasswordAccount(
    @User('id') userId,
    @Body() changePasswordAccountDto,
  ) {
    const data = await this.clientKafka
      .send('changePasswordAccount', {
        ...changePasswordAccountDto,
        id: userId,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }
}
