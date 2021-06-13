import { Injectable } from '@nestjs/common';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import * as _ from 'lodash';

import { Permission } from '../entities/permission.entity';
import { FindPermissionDto } from '../../application/dtos/permission/find-permission.dto';
import { PermissionIdExistsDto } from '../../application/dtos/permission/permission-id-exists.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findAll(
    findAllPermissionDto: FindPermissionDto,
  ): Promise<Permission[]> {
    return await this.findQueryBuilder(findAllPermissionDto).getMany();
  }

  async findAllCount(
    findAllCountPermissionDto: FindPermissionDto,
  ): Promise<number> {
    return await this.findQueryBuilder(findAllCountPermissionDto).getCount();
  }

  async findOne(findOnePermissionDto: FindPermissionDto): Promise<Permission> {
    const data = await this.findAll(findOnePermissionDto);
    return _.head(data);
  }

  async idExists(
    permissionIdExistsDto: PermissionIdExistsDto,
  ): Promise<boolean> {
    const { id } = permissionIdExistsDto;
    return (
      (await this.permissionRepository.count({
        where: { id },
      })) > 0
    );
  }

  findQueryBuilder(params: FindPermissionDto): SelectQueryBuilder<Permission> {
    const {
      id,
      ids,
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

    let qb = this.permissionRepository
      .createQueryBuilder('permission')
      .where((qb) => {
        qb.where({
          ...(id || ids ? { id: In(filteredIds) } : {}),
        });

        if (search !== undefined) {
          const params = { search: `%${search}%` };

          qb.andWhere(
            new Brackets((q) => {
              q.where('permission.name LIKE :search', params);
            }),
          );
        }
      });

    if (relations !== undefined) {
      if (relations.includes('transaction')) {
        qb = qb.leftJoinAndSelect('permission.transaction', 'transaction');
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
