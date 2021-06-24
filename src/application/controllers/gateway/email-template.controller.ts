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

@Controller('v1/email-template')
export class EmailTemplateController {
  constructor(
    @Inject('CAMPAIGN_SERVICE')
    private readonly campaignService: ClientProxy,
  ) {}

  @Post()
  async create(
    @Body() createEmailTemplateDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.campaignService
      .send('createEmailTemplate', {
        ...createEmailTemplateDto,
        organization_id: organizationId,
        actor: userId,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Get()
  async findAll(
    @Query() findEmailTemplateDto,
    @User('organization_id') organizationId,
  ) {
    const data = await this.campaignService
      .send('findAllEmailTemplate', {
        ...findEmailTemplateDto,
        organization_id: organizationId,
      })
      .toPromise()
      .catch(clientRpcException);

    if (findEmailTemplateDto.per_page === undefined) {
      return { data };
    }

    const total = await this.campaignService
      .send('findAllCountEmailTemplate', {
        ...findEmailTemplateDto,
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
    @Query() findEmailTemplateDto,
    @User('organization_id') organizationId,
  ) {
    const data = await this.campaignService
      .send('findOneEmailTemplate', {
        ...findEmailTemplateDto,
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
    @Body() updateEmailTemplateDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.campaignService
      .send('updateEmailTemplate', {
        ...updateEmailTemplateDto,
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
    @Body() deleteEmailTemplateDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.campaignService
      .send('removeEmailTemplate', {
        ...deleteEmailTemplateDto,
        organization_id: organizationId,
        actor: userId,
        id,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }
}
