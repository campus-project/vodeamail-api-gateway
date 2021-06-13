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

@Controller('v1/user')
export class UserController {
  constructor(
    @Inject('CLIENT_KAFKA')
    private readonly clientKafka: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = [
      'createUser',
      'findAllUser',
      'findAllCountUser',
      'findOneUser',
      'updateUser',
      'removeUser',
    ];

    for (const pattern of patterns) {
      this.clientKafka.subscribeToResponseOf(pattern);
    }
  }

  @Post()
  async create(
    @Body() createUserDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.clientKafka
      .send('createUser', {
        ...createUserDto,
        organization_id: organizationId,
        actor: userId,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Get()
  async findAll(@Query() findUserDto, @User('organization_id') organizationId) {
    const data = await this.clientKafka
      .send('findAllUser', {
        ...findUserDto,
        organization_id: organizationId,
      })
      .toPromise()
      .catch(clientRpcException);

    if (findUserDto.per_page === undefined) {
      return { data };
    }

    const total = await this.clientKafka
      .send('findAllCountUser', {
        ...findUserDto,
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
    @Query() findUserDto,
    @User('organization_id') organizationId,
  ) {
    const data = await this.clientKafka
      .send('findOneUser', {
        ...findUserDto,
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
    @Body() updateUserDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.clientKafka
      .send('updateUser', {
        ...updateUserDto,
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
    @Body() deleteUserDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.clientKafka
      .send('removeUser', {
        ...deleteUserDto,
        organization_id: organizationId,
        actor: userId,
        id,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }
}
