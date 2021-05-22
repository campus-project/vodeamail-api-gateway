import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService as NestJwt } from '@nestjs/jwt';

import moment from 'moment';

import { UserDto } from '../../application/dtos/jwt/user.dto';
import { RefreshTokenService } from './refresh-token.service';
import { DecodedRefreshTokenDto } from '../../application/dtos/jwt/decoded-refresh-token.dto';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RefreshTokenDto } from '../../application/dtos/jwt/refresh-token.dto';
import { TokenExpiredError } from 'jsonwebtoken';
import { AccessTokenDto } from '../../application/dtos/jwt/access-token.dto';
import { DecodedAccessTokenDto } from '../../application/dtos/jwt/decoded-access-token.dto';
import { ClientKafka } from '@nestjs/microservices';
import { clientRpcException } from '../../@core/helpers/exception-rpc.helper';
import { LoginDto } from '../../application/dtos/jwt/login.dto';

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwt,
    @Inject('CLIENT_KAFKA')
    private readonly clientKafka: ClientKafka,
    @Inject('REFRESH_TOKEN_SERVICE')
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  onModuleInit() {
    const patterns = ['authLogin'];

    for (const pattern of patterns) {
      this.clientKafka.subscribeToResponseOf(pattern);
    }
  }

  async createAccessTokenAndRefreshToken(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const data = await this.clientKafka
      .send('authLogin', { email, password })
      .toPromise()
      .catch(clientRpcException);

    if (!data) {
      throw new UnauthorizedException(
        `The credentials does not match in our records.`,
      );
    }

    const accessToken = await this.generateAccessToken({ user_id: data.id });
    const refreshToken = await this.generateRefreshToken({ user_id: data.id });

    const decodedAccessToken = await this.decodeAccessToken({
      access_token: accessToken,
    });

    return {
      token_type: 'Bearer',
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: decodedAccessToken.exp,
    };
  }

  async createAccessTokenFromRefreshToken(refreshTokenDto: RefreshTokenDto) {
    const { user } = await this.resolveRefreshToken(refreshTokenDto);

    return await this.generateAccessToken({ user_id: user.id });
  }

  async generateAccessToken(userDto: UserDto) {
    return this.jwtService.sign({
      subject: userDto.user_id,
    });
  }

  async generateRefreshToken(userDto: UserDto) {
    const refreshToken = await this.refreshTokenService.create({
      user_id: userDto.user_id,
      ttl: 60 * 60 * 24 * 7, // 7 days
    });

    return this.jwtService.signAsync(
      {},
      {
        expiresIn: '30d',
        subject: refreshToken.user_id,
        jwtid: refreshToken.id,
      },
    );
  }

  async resolveRefreshToken(refreshTokenDto: RefreshTokenDto) {
    const payload = await this.decodeRefreshToken(refreshTokenDto);
    const token = await this.getStoredTokenFromRefreshTokenDecodedToken(
      payload,
    );

    if (
      !token ||
      token.is_revoked ||
      moment(token.expired_at).format() <= moment().format()
    ) {
      throw new BadRequestException('Refresh token expired');
    }

    const duration = moment.duration(moment(token.expired_at).diff(moment()));
    if (duration.asMinutes() < 0) {
      await this.refreshTokenService.revoke({ id: token.id });
      throw new BadRequestException('Refresh token expired');
    }

    const user = await this.getUserFromRefreshTokenDecodedToken(payload);

    return { user, token };
  }

  async decodeAccessToken(
    accessTokenDto: AccessTokenDto,
  ): Promise<DecodedAccessTokenDto> {
    try {
      return await this.jwtService.verifyAsync(accessTokenDto.access_token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new BadRequestException('Refresh token expired');
      } else {
        throw new BadRequestException('Refresh token malformed');
      }
    }
  }

  async decodeRefreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<DecodedRefreshTokenDto> {
    try {
      return await this.jwtService.verifyAsync(refreshTokenDto.refresh_token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new BadRequestException('Refresh token expired');
      } else {
        throw new BadRequestException('Refresh token malformed');
      }
    }
  }

  async getUserFromRefreshTokenDecodedToken(
    decodedRefreshToken: DecodedRefreshTokenDto,
  ): Promise<any> {
    if (!decodedRefreshToken.sub) {
      throw new BadRequestException('Refresh token malformed');
    }

    const data = await this.clientKafka
      .send('authLoginWithId', {
        id: decodedRefreshToken.sub,
      })
      .toPromise()
      .catch(clientRpcException);

    if (!data) {
      throw new BadRequestException('Refresh token malformed');
    }

    return data;
  }

  async getStoredTokenFromRefreshTokenDecodedToken(
    decodedRefreshTokenDto: DecodedRefreshTokenDto,
  ): Promise<RefreshToken> {
    if (!decodedRefreshTokenDto.jti) {
      throw new BadRequestException('Refresh token malformed');
    }

    return await this.refreshTokenService.findOne({
      id: decodedRefreshTokenDto.jti,
    });
  }
}
