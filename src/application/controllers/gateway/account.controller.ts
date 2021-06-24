import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { User } from '../../../@core/decorators/user.decorator';
import { clientRpcException } from '../../../@core/helpers/exception-rpc.helper';

@Controller('v1/account')
export class AccountController {
  constructor(
    @Inject('ACCOUNT_SERVICE')
    private readonly accountService: ClientProxy,
  ) {}

  @Get()
  async getAccount(@User() user) {
    return { data: user };
  }

  @Post()
  async updateAccount(@Body() updateAccountDto, @User('id') userId) {
    const data = await this.accountService
      .send('updateAccount', { ...updateAccountDto, id: userId })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Post('change-password')
  async changePasswordAccount(
    @Body() changePasswordAccountDto,
    @User('id') userId,
  ) {
    const data = await this.accountService
      .send('changePasswordAccount', {
        ...changePasswordAccountDto,
        id: userId,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Get('organization')
  async getOrganization(@User('organization_id') organizationId) {
    const data = await this.accountService
      .send('getMyOrganization', {
        id: organizationId,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Post('organization')
  async updateOrganization(
    @Body() updateOrganizationDto,
    @User('id') userId,
    @User('organization_id') organizationId,
  ) {
    const data = await this.accountService
      .send('updateMyOrganization', {
        ...updateOrganizationDto,
        id: organizationId,
        actor: userId,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }
}
