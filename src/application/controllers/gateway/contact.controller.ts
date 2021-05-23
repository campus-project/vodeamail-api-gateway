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

@Controller('v1/contact')
export class ContactController {
  constructor(
    @Inject('CLIENT_KAFKA')
    private readonly clientKafka: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = [
      'createContact',
      'findAllContact',
      'findOneContact',
      'updateContact',
      'removeContact',
    ];

    for (const pattern of patterns) {
      this.clientKafka.subscribeToResponseOf(pattern);
    }
  }

  @Post()
  async create(
    @Body() createContactDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.clientKafka
      .send('createContact', {
        ...createContactDto,
        organization_id: organizationId,
        actor: userId,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Get()
  async findAll(
    @Query() findContactDto,
    @User('organization_id') organizationId,
  ) {
    const data = await this.clientKafka
      .send('findAllContact', {
        ...findContactDto,
        organization_id: organizationId,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query() findContactDto,
    @User('organization_id') organizationId,
  ) {
    const data = await this.clientKafka
      .send('findOneContact', {
        ...findContactDto,
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
    @Body() updateContactDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.clientKafka
      .send('updateContact', {
        ...updateContactDto,
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
    @Body() deleteContactDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.clientKafka
      .send('removeContact', {
        ...deleteContactDto,
        organization_id: organizationId,
        actor: userId,
        id,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }
}
