import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { PermissionService } from '../../domain/services/permission.service';
import { FindPermissionDto } from '../dtos/permission/find-permission.dto';

@Controller('v1/permission')
export class PermissionController {
  constructor(
    @Inject('PERMISSION_SERVICE')
    private readonly permissionService: PermissionService,
  ) {}

  @Get()
  async findAll(@Query() findPermissionDto: FindPermissionDto) {
    const data = await this.permissionService.findAll(findPermissionDto);

    if (findPermissionDto.per_page === undefined) {
      return { data };
    }

    const total = await this.permissionService.findAllCount(findPermissionDto);

    return {
      data,
      meta: { total: Number(total) },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query() findPermissionDto) {
    const data = await this.permissionService.findOne({
      ...findPermissionDto,
      id,
    });

    if (!data) {
      throw new NotFoundException(`Count not find resource ${id}`);
    }

    return { data };
  }
}
