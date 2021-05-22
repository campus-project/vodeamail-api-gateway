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

@Controller('v1/organization')
export class OrganizationController {
  constructor(
    @Inject('CLIENT_KAFKA')
    private readonly clientKafka: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = [
      'createOrganization',
      'findAllOrganization',
      'findOneOrganization',
      'updateOrganization',
      'removeOrganization',
    ];

    for (const pattern of patterns) {
      this.clientKafka.subscribeToResponseOf(pattern);
    }
  }

  @Post()
  async create(@Body() createOrganizationDto) {
    const data = await this.clientKafka
      .send('createOrganization', createOrganizationDto)
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Get()
  async findAll(@Query() findOrganizationDto) {
    const data = await this.clientKafka
      .send('findAllOrganization', findOrganizationDto)
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query() findOrganizationDto) {
    const data = await this.clientKafka
      .send('findOneOrganization', { ...findOrganizationDto, id })
      .toPromise()
      .catch(clientRpcException);

    if (!data) {
      throw new NotFoundException(`Count not find resource ${id}`);
    }

    return { data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateOrganizationDto) {
    const data = await this.clientKafka
      .send('updateOrganization', { ...updateOrganizationDto, id })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Body() deleteOrganizationDto) {
    const data = await this.clientKafka
      .send('removeOrganization', { ...deleteOrganizationDto, id })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }
}
