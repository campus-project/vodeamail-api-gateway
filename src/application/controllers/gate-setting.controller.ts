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
import { User } from '../../@core/decorators/user.decorator';

import { GateSettingService } from '../../domain/services/gate-setting.service';
import { CreateGateSettingDto } from '../dtos/gate-setting/create-gate-setting.dto';
import { FindGateSettingDto } from '../dtos/gate-setting/find-gate-setting.dto';
import { UpdateGateSettingDto } from '../dtos/gate-setting/update-gate-setting.dto';
import { DeleteGateSettingDto } from '../dtos/gate-setting/delete-gate-setting.dto';

@Controller('v1/gate-setting')
export class GateSettingController {
  constructor(
    @Inject('GATE_SETTING_SERVICE')
    private readonly gateSettingService: GateSettingService,
  ) {}

  @Post()
  async create(
    @Body() createGateSettingDto: CreateGateSettingDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.gateSettingService.create({
      ...createGateSettingDto,
      organization_id: organizationId,
      actor: userId,
    });

    return { data };
  }

  @Get()
  async findAll(
    @Query() findGateSettingDto: FindGateSettingDto,
    @User('organization_id') organizationId,
  ) {
    const data = await this.gateSettingService.findAll({
      ...findGateSettingDto,
      organization_id: organizationId,
    });

    if (findGateSettingDto.per_page === undefined) {
      return { data };
    }

    const total = await this.gateSettingService.findAllCount({
      ...findGateSettingDto,
      organization_id: organizationId,
    });

    return {
      data,
      meta: { total: Number(total) },
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query() findGateSettingDto: FindGateSettingDto,
    @User('organization_id') organizationId,
  ) {
    const data = await this.gateSettingService.findOne({
      ...findGateSettingDto,
      organization_id: organizationId,
      id,
    });

    if (!data) {
      throw new NotFoundException(`Count not find resource ${id}`);
    }

    return { data };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGateSettingDto: UpdateGateSettingDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.gateSettingService.update({
      ...updateGateSettingDto,
      organization_id: organizationId,
      actor: userId,
      id,
    });

    return { data };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Body() deleteGateSettingDto: DeleteGateSettingDto,
    @User('organization_id') organizationId,
    @User('id') userId,
  ) {
    const data = await this.gateSettingService.remove({
      ...deleteGateSettingDto,
      organization_id: organizationId,
      actor: userId,
      id,
    });

    return { data };
  }
}
