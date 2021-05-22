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

@Controller('v1/role')
export class RoleController {
  constructor(
    @Inject('CLIENT_KAFKA')
    private readonly clientKafka: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = [
      'createRole',
      'findAllRole',
      'findOneRole',
      'updateRole',
      'removeRole',
    ];

    for (const pattern of patterns) {
      this.clientKafka.subscribeToResponseOf(pattern);
    }
  }

  @Post()
  async create(@Body() createRoleDto) {
    const data = await this.clientKafka
      .send('createRole', createRoleDto)
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Get()
  async findAll(@Query() findRoleDto) {
    const data = await this.clientKafka
      .send('findAllRole', findRoleDto)
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query() findRoleDto) {
    const data = await this.clientKafka
      .send('findOneRole', { ...findRoleDto, id })
      .toPromise()
      .catch(clientRpcException);

    if (!data) {
      throw new NotFoundException(`Count not find resource ${id}`);
    }

    return { data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto) {
    const data = await this.clientKafka
      .send('updateRole', { ...updateRoleDto, id })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Body() deleteRoleDto) {
    const data = await this.clientKafka
      .send('removeRole', { ...deleteRoleDto, id })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }
}
