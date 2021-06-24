import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';

import * as _ from 'lodash';

import { GateSetting } from '../entities/gate-setting.entity';
import { GateSettingPermission } from '../entities/gate-setting-permission.entity';
import { Permission } from '../entities/permission.entity';
import { CreateGateSettingDto } from '../../application/dtos/gate-setting/create-gate-setting.dto';
import { UpdateGateSettingDto } from '../../application/dtos/gate-setting/update-gate-setting.dto';
import { FindGateSettingDto } from '../../application/dtos/gate-setting/find-gate-setting.dto';
import { DeleteGateSettingDto } from '../../application/dtos/gate-setting/delete-gate-setting.dto';
import { clientRpcException } from '../../@core/helpers/exception-rpc.helper';

@Injectable()
export class GateSettingService {
  constructor(
    @InjectRepository(GateSetting)
    private readonly gateSettingRepository: Repository<GateSetting>,
    @InjectRepository(GateSettingPermission)
    private readonly gateSettingPermissionRepository: Repository<GateSettingPermission>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @Inject('ACCOUNT_SERVICE')
    private readonly accountService: ClientProxy,
  ) {}

  async create(
    createGateSettingDto: CreateGateSettingDto,
  ): Promise<GateSetting> {
    const {
      organization_id,
      name,
      valid_from,
      role_id,
      permission_ids,
      actor,
    } = createGateSettingDto;

    const data = await this.gateSettingRepository.save({
      organization_id,
      name,
      valid_from,
      role_id,
      created_by: actor,
      updated_by: actor,
    });

    if (permission_ids.length) {
      const permissions = await this.permissionRepository.find({
        where: {
          id: In([...new Set(permission_ids)]),
        },
      });

      for (const permission of permissions) {
        await this.gateSettingPermissionRepository.save(
          this.gateSettingPermissionRepository.create({
            permission_id: permission.id,
            gate_setting: data,
          }),
        );
      }
    }

    return await this.findOne({
      id: data.id,
      organization_id: data.organization_id,
    });
  }

  async findAll(
    findAllGateSettingDto: FindGateSettingDto,
  ): Promise<GateSetting[]> {
    const { relations, organization_id } = findAllGateSettingDto;
    const data = await this.findQueryBuilder(findAllGateSettingDto).getMany();

    if (relations === undefined || relations.length === 0) {
      return data;
    }

    const gateSettingIds = [];
    const roleIds = [];

    const relationValues = {
      gateSettingPermissions: undefined,
      roles: undefined,
    };

    data.forEach((gateSetting) => {
      gateSettingIds.push(gateSetting.id);
      roleIds.push(gateSetting.role_id);
    });

    if (relations.includes('permissions')) {
      relationValues.gateSettingPermissions =
        await this.gateSettingPermissionRepository.find({
          where: { gate_setting_id: In([...new Set(gateSettingIds)]) },
          relations: ['permission'],
        });
    }

    if (relations.includes('role')) {
      relationValues.roles = await this.accountService
        .send('findAllRole', {
          ids: [...new Set(roleIds)],
          organization_id,
        })
        .toPromise()
        .catch(clientRpcException);
    }

    return data.map((gateSetting) => {
      if (relationValues.gateSettingPermissions !== undefined) {
        const permissions = [];
        relationValues.gateSettingPermissions.forEach(
          (gateSettingPermission) => {
            if (gateSettingPermission.gate_setting_id === gateSetting.id) {
              permissions.push(gateSettingPermission.permission);
            }
          },
        );

        Object.assign(gateSetting, {
          permissions,
        });
      }

      if (relationValues.roles !== undefined) {
        Object.assign(gateSetting, {
          role: relationValues.roles.find(
            (role) => role.id === gateSetting.role_id,
          ),
        });
      }

      return gateSetting;
    });
  }

  async findAllCount(
    findAllCountGateSettingDto: FindGateSettingDto,
  ): Promise<number> {
    return await this.findQueryBuilder(findAllCountGateSettingDto).getCount();
  }

  async findOne(
    findOneGateSettingDto: FindGateSettingDto,
  ): Promise<GateSetting> {
    const data = await this.findAll(findOneGateSettingDto);
    return _.head(data);
  }

  async update(
    updateGateSettingDto: UpdateGateSettingDto,
  ): Promise<GateSetting> {
    const {
      id,
      organization_id,
      name,
      valid_from,
      role_id,
      permission_ids,
      actor,
    } = updateGateSettingDto;

    const data = await this.gateSettingRepository.findOne({
      where: {
        id,
        organization_id,
      },
    });

    if (!data) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Count not find resource ${id}.`,
        error: 'Not Found',
      });
    }

    await this.gateSettingPermissionRepository.delete({ gate_setting_id: id });

    await this.gateSettingRepository.save({
      ...data,
      name,
      valid_from,
      role_id,
      updated_by: actor,
    });

    if (permission_ids.length) {
      const permissions = await this.permissionRepository.find({
        where: {
          id: In([...new Set(permission_ids)]),
        },
      });

      for (const permission of permissions) {
        await this.gateSettingPermissionRepository.save(
          this.gateSettingPermissionRepository.create({
            permission_id: permission.id,
            gate_setting: data,
          }),
        );
      }
    }

    return await this.findOne({
      id: data.id,
      organization_id: data.organization_id,
    });
  }

  async remove(
    deleteGateSettingDto: DeleteGateSettingDto,
  ): Promise<GateSetting> {
    const { id, is_hard, organization_id, actor } = deleteGateSettingDto;

    const data = await this.gateSettingRepository.findOne({
      where: {
        id,
        organization_id,
      },
    });

    if (!data) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Count not find resource ${id}.`,
        error: 'Not Found',
      });
    }

    if (is_hard) {
      await this.gateSettingRepository.remove(data);
    } else {
      await this.gateSettingRepository.save({
        ...data,
        deleted_by: actor,
        deleted_at: new Date().toISOString(),
      });
    }

    return data;
  }

  findQueryBuilder(
    params: FindGateSettingDto,
  ): SelectQueryBuilder<GateSetting> {
    const {
      id,
      ids,
      organization_id,
      search,
      per_page,
      page = 1,
      order_by,
      sorted_by = 'ASC',
      relations,
    } = params;

    const filteredIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      filteredIds.push(id);
    }

    let qb = this.gateSettingRepository
      .createQueryBuilder('gate_setting')
      .where((qb) => {
        qb.where({
          organization_id: organization_id,
          ...(id || ids ? { id: In(filteredIds) } : {}),
        });

        if (search !== undefined) {
          const params = { search: `%${search}%` };

          qb.andWhere(
            new Brackets((q) => {
              q.where('gate_setting.name LIKE :search', params);
            }),
          );
        }
      });

    if (relations !== undefined) {
      if (relations.includes('gate_setting_permissions')) {
        qb = qb.leftJoinAndSelect(
          'gate_setting.gate_setting_permissions',
          'gate_setting_permissions',
        );
      }
    }

    if (per_page !== undefined) {
      qb = qb.take(per_page).skip(page > 1 ? per_page * (page - 1) : 0);
    }

    if (order_by !== undefined) {
      qb = qb.orderBy(
        order_by,
        ['desc'].includes(sorted_by.toLowerCase()) ? 'DESC' : 'ASC',
      );
    }

    return qb;
  }
}
