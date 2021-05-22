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
      'findOneUser',
      'updateUser',
      'removeUser',
    ];

    for (const pattern of patterns) {
      this.clientKafka.subscribeToResponseOf(pattern);
    }
  }

  @Post()
  async create(@Body() createUserDto) {
    const data = await this.clientKafka
      .send('createUser', createUserDto)
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Get()
  async findAll(@Query() findUserDto) {
    const data = await this.clientKafka
      .send('findAllUser', findUserDto)
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query() findUserDto) {
    const data = await this.clientKafka
      .send('findOneUser', { ...findUserDto, id })
      .toPromise()
      .catch(clientRpcException);

    if (!data) {
      throw new NotFoundException(`Count not find resource ${id}`);
    }

    return { data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto) {
    const data = await this.clientKafka
      .send('updateUser', { ...updateUserDto, id })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Body() deleteUserDto) {
    const data = await this.clientKafka
      .send('removeUser', { ...deleteUserDto, id })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }
}
