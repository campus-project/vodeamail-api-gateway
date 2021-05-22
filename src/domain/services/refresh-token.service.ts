import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import * as moment from 'moment';

import { RefreshToken } from '../entities/refresh-token.entity';
import { CreateRefreshTokenDto } from '../../application/dtos/refresh-token/create-refresh-token.dto';
import { FindRefreshTokenDto } from '../../application/dtos/refresh-token/find-refresh-token.dto';
import { RevokeRefreshTokenDto } from '../../application/dtos/refresh-token/revoke-refresh-token.dto';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async create(
    createRefreshTokenDto: CreateRefreshTokenDto,
  ): Promise<RefreshToken> {
    const { user_id, ttl } = createRefreshTokenDto;

    const data = await this.refreshTokenRepository.save({
      user_id,
      expired_at: moment().add(ttl, 'minutes').toISOString(),
    });

    return await this.findOne({ id: data.id });
  }

  async findOne(
    findRefreshTokenDto: FindRefreshTokenDto,
  ): Promise<RefreshToken | null> {
    const { id } = findRefreshTokenDto;
    return await this.refreshTokenRepository.findOne({ id });
  }

  async revoke(revokeRefreshToken: RevokeRefreshTokenDto): Promise<boolean> {
    const { id } = revokeRefreshToken;

    const data = await this.refreshTokenRepository.findOne({ id });

    if (!data) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Count not find resource ${id}`,
        error: 'Not Found',
      });
    }

    Object.assign(data, {
      is_revoked: true,
    });

    await this.refreshTokenRepository.save(data);

    return true;
  }
}
