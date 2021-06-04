import { Injectable } from '@nestjs/common';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import * as _ from 'lodash';

import { Transaction } from '../entities/transaction.entity';
import { FindTransactionDto } from '../../application/dtos/transaction/find-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async findAll(
    findAllTransactionDto: FindTransactionDto,
  ): Promise<Transaction[]> {
    return await this.findQueryBuilder(findAllTransactionDto).getMany();
  }

  async findAllCount(
    findAllCountTransactionDto: FindTransactionDto,
  ): Promise<number> {
    return await this.findQueryBuilder(findAllCountTransactionDto).getCount();
  }

  async findOne(
    findOneTransactionDto: FindTransactionDto,
  ): Promise<Transaction> {
    const data = await this.findAll(findOneTransactionDto);
    return _.head(data);
  }

  findQueryBuilder(
    params: FindTransactionDto,
  ): SelectQueryBuilder<Transaction> {
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

    let qb = this.transactionRepository
      .createQueryBuilder('transaction')
      .where((qb) => {
        qb.where({
          ...(id || ids ? { id: In(filteredIds) } : {}),
        });

        if (search !== undefined) {
          const params = { search: `%${search}%` };

          qb.andWhere(
            new Brackets((q) => {
              q.where('transaction.name LIKE :search', params);
            }),
          );
        }
      });

    if (relations !== undefined) {
      if (relations.includes('permissions')) {
        qb = qb.leftJoinAndSelect('transaction.permissions', 'permissions');
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
