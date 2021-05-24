import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { clientRpcException } from '../../../@core/helpers/exception-rpc.helper';
import { User } from '../../../@core/decorators/user.decorator';

@Controller('v1/email-analytic')
export class EmailAnalyticController {
  constructor(
    @Inject('CLIENT_KAFKA')
    private readonly clientKafka: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = ['findAllEmailAnalytic', 'findOneEmailAnalytic'];

    for (const pattern of patterns) {
      this.clientKafka.subscribeToResponseOf(pattern);
    }
  }

  @Get()
  async findAll(
    @Query() findEmailAnalyticDto,
    @User('organization_id') organizationId,
  ) {
    const data = await this.clientKafka
      .send('findAllEmailAnalytic', {
        ...findEmailAnalyticDto,
        organization_id: organizationId,
      })
      .toPromise()
      .catch(clientRpcException);

    return { data };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query() findEmailAnalyticDto,
    @User('organization_id') organizationId,
  ) {
    const data = await this.clientKafka
      .send('findOneEmailAnalytic', {
        ...findEmailAnalyticDto,
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
}
