import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import moment from 'moment';

import { RefreshToken } from '../entities/refresh-token.entity';
import { CreateRefreshTokenDto } from '../../application/dtos/refresh-token/create-refresh-token.dto';
import { FindRefreshTokenDto } from '../../application/dtos/refresh-token/find-refresh-token.dto';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async create(
    createRefreshTokenDto: CreateRefreshTokenDto,
  ): Promise<RefreshToken> {
    const { user_id } = createRefreshTokenDto;

    const data = await this.refreshTokenRepository.save({
      user_id,
      expired_at: moment().add(15, 'days').toISOString(),
    });

    return await this.findOne({ id: data.id });
  }

  async findOne(
    findRefreshTokenDto: FindRefreshTokenDto,
  ): Promise<RefreshToken | null> {
    const { id } = findRefreshTokenDto;
    return await this.refreshTokenRepository.findOne({ id });
  }
}
