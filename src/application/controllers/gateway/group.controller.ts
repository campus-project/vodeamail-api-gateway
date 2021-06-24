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

@Controller('v1/group')
export class GroupController {
  constructor(
    @Inject('AUDIENCE_SERVICE')
    private readonly audienceService: ClientProxy,
  ) {}

  @Post()
  async create(
    @Body() createGroupDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.audienceService
      .send('createGroup', {
        ...createGroupDto,
        organization_id: organizationId,
        actor: userId,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Get()
  async findAll(
    @Query() findGroupDto,
    @User('organization_id') organizationId,
  ) {
    const data = await this.audienceService
      .send('findAllGroup', {
        ...findGroupDto,
        organization_id: organizationId,
      })
      .toPromise()
      .catch(clientRpcException);

    if (findGroupDto.per_page === undefined) {
      return { data };
    }

    const total = await this.audienceService
      .send('findAllCountGroup', {
        ...findGroupDto,
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
    @Query() findGroupDto,
    @User('organization_id') organizationId,
  ) {
    const data = await this.audienceService
      .send('findOneGroup', {
        ...findGroupDto,
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
    @Body() updateGroupDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.audienceService
      .send('updateGroup', {
        ...updateGroupDto,
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
    @Body() deleteGroupDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.audienceService
      .send('removeGroup', {
        ...deleteGroupDto,
        organization_id: organizationId,
        actor: userId,
        id,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }
}
