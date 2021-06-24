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

@Controller('v1/email-campaign')
export class EmailCampaignController {
  constructor(
    @Inject('CAMPAIGN_SERVICE')
    private readonly campaignService: ClientProxy,
  ) {}

  @Post()
  async create(
    @Body() createEmailCampaignDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.campaignService
      .send('createEmailCampaign', {
        ...createEmailCampaignDto,
        organization_id: organizationId,
        actor: userId,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Get()
  async findAll(
    @Query() findEmailCampaignDto,
    @User('organization_id') organizationId,
  ) {
    const data = await this.campaignService
      .send('findAllEmailCampaign', {
        ...findEmailCampaignDto,
        organization_id: organizationId,
      })
      .toPromise()
      .catch(clientRpcException);

    if (findEmailCampaignDto.per_page === undefined) {
      return { data };
    }

    const total = await this.campaignService
      .send('findAllCountEmailCampaign', {
        ...findEmailCampaignDto,
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
    @Query() findEmailCampaignDto,
    @User('organization_id') organizationId,
  ) {
    const data = await this.campaignService
      .send('findOneEmailCampaign', {
        ...findEmailCampaignDto,
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
    @Body() updateEmailCampaignDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.campaignService
      .send('updateEmailCampaign', {
        ...updateEmailCampaignDto,
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
    @Body() deleteEmailCampaignDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.campaignService
      .send('removeEmailCampaign', {
        ...deleteEmailCampaignDto,
        organization_id: organizationId,
        actor: userId,
        id,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Get('view/usage')
  async viewSummaryUsage(
    @Param('id') id: string,
    @Query() findEmailCampaignDto,
    @User('organization_id') organizationId,
  ) {
    const data = await this.campaignService
      .send('findSummaryUsageEmailCampaign', {
        ...findEmailCampaignDto,
        organization_id: organizationId,
        id,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }
}
