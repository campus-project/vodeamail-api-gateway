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
import { ClientKafka } from '@nestjs/microservices';
import { clientRpcException } from '../../../@core/helpers/exception-rpc.helper';
import { User } from '../../../@core/decorators/user.decorator';

@Controller('v1/group')
export class GroupController {
  constructor(
    @Inject('CLIENT_KAFKA')
    private readonly clientKafka: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = [
      'createGroup',
      'findAllGroup',
      'findAllCountGroup',
      'findOneGroup',
      'updateGroup',
      'removeGroup',
    ];

    for (const pattern of patterns) {
      this.clientKafka.subscribeToResponseOf(pattern);
    }
  }

  @Post()
  async create(
    @Body() createGroupDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.clientKafka
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
    const data = await this.clientKafka
      .send('findAllGroup', {
        ...findGroupDto,
        organization_id: organizationId,
      })
      .toPromise()
      .catch(clientRpcException);

    if (findGroupDto.per_page === undefined) {
      return { data };
    }

    const total = await this.clientKafka
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
    const data = await this.clientKafka
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
    const data = await this.clientKafka
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
    const data = await this.clientKafka
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
