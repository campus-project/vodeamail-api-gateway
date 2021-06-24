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

@Controller('v1/contact')
export class ContactController {
  constructor(
    @Inject('AUDIENCE_SERVICE')
    private readonly audienceService: ClientProxy,
  ) {}

  @Post()
  async create(
    @Body() createContactDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.audienceService
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
    const data = await this.audienceService
      .send('findAllContact', {
        ...findContactDto,
        organization_id: organizationId,
      })
      .toPromise()
      .catch(clientRpcException);

    if (findContactDto.per_page === undefined) {
      return { data };
    }

    const total = await this.audienceService
      .send('findAllCountContact', {
        ...findContactDto,
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
    @Query() findContactDto,
    @User('organization_id') organizationId,
  ) {
    const data = await this.audienceService
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
    const data = await this.audienceService
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
    const data = await this.audienceService
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
