import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { TransactionService } from '../../domain/services/transaction.service';
import { FindTransactionDto } from '../dtos/transaction/find-transaction.dto';

@Controller('v1/transaction')
export class TransactionController {
  constructor(
    @Inject('TRANSACTION_SERVICE')
    private readonly transactionService: TransactionService,
  ) {}

  @Get()
  async findAll(@Query() findTransactionDto: FindTransactionDto) {
    const data = await this.transactionService.findAll(findTransactionDto);

    if (findTransactionDto.per_page === undefined) {
      return { data };
    }

    const total = await this.transactionService.findAllCount(
      findTransactionDto,
    );

    return {
      data,
      meta: { total: Number(total) },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query() findTransactionDto) {
    const data = await this.transactionService.findOne({
      ...findTransactionDto,
      id,
    });

    if (!data) {
      throw new NotFoundException(`Count not find resource ${id}`);
    }

    return { data };
  }
}
