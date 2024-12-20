import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { clientRpcException } from '../../../@core/helpers/exception-rpc.helper';
import { User } from '../../../@core/decorators/user.decorator';

@Controller('v1/role')
export class RoleController {
  constructor(
    @Inject('ACCOUNT_SERVICE')
    private readonly accountService: ClientProxy,
  ) {}

  @Post()
  async create(
    @Body() createRoleDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.accountService
      .send('createRole', {
        ...createRoleDto,
        organization_id: organizationId,
        actor: userId,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Get()
  async findAll(@Query() findRoleDto, @User('organization_id') organizationId) {
    const data = await this.accountService
      .send('findAllRole', {
        ...findRoleDto,
        organization_id: organizationId,
      })
      .toPromise()
      .catch(clientRpcException);

    if (findRoleDto.per_page === undefined) {
      return { data };
    }

    const total = await this.accountService
      .send('findAllCountRole', {
        ...findRoleDto,
        organization_id: organizationId,
      })
      .toPromise();

    return {
      data,
      meta: { total: Number(total) },
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query() findRoleDto,
    @User('organization_id') organizationId,
  ) {
    const data = await this.accountService
      .send('findOneRole', {
        ...findRoleDto,
        organization_id: organizationId,
        id,
      })
      .toPromise()
      .catch(clientRpcException);

    if (!data) {
      throw new NotFoundException(`Count not find resource ${id}`);
    }

    return { data };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.accountService
      .send('updateRole', {
        ...updateRoleDto,
        organization_id: organizationId,
        actor: userId,
        id,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Body() deleteRoleDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.accountService
      .send('removeRole', {
        ...deleteRoleDto,
        organization_id: organizationId,
        actor: userId,
        id,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }
}
