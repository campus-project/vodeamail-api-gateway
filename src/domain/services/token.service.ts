import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { TokenExpiredError } from 'jsonwebtoken';

import * as moment from 'moment';
import { clientRpcException } from '../../@core/helpers/exception-rpc.helper';

import { RefreshTokenService } from './refresh-token.service';
import { LoginDto } from '../../application/dtos/token/login.dto';
import { UserDto } from '../../application/dtos/token/user.dto';
import { RefreshTokenDto } from '../../application/dtos/token/refresh-token.dto';
import { GeneratedAccessTokenDto } from '../../application/dtos/token/generated-access-token.dto';
import { GeneratedRefreshTokenDto } from '../../application/dtos/token/generated-refresh-token.dto';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('CLIENT_KAFKA')
    private readonly clientKafka: ClientKafka,
    @Inject('REFRESH_TOKEN_SERVICE')
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  onModuleInit() {
    const patterns = ['authLogin', 'authLoginWithId'];
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

    const { access_token, expires_in } = await this.generateAccessToken({
      user_id: data.id,
    });

    const { refresh_token } = await this.generateRefreshToken({
      user_id: data.id,
    });

    return {
      token_type: 'Bearer',
      access_token,
      expires_in,
      refresh_token,
    };
  }

  async createAccessTokenFromRefreshToken(refreshTokenDto: RefreshTokenDto) {
    const { user } = await this.resolveRefreshToken(refreshTokenDto);

    return await this.generateAccessToken({ user_id: user.id });
  }

  async generateAccessToken(
    userDto: UserDto,
  ): Promise<GeneratedAccessTokenDto> {
    const generatedAccessToken = this.jwtService.sign({
      subject: userDto.user_id,
    });

    let decodedAccessToken = null;

    try {
      decodedAccessToken = await this.jwtService.verifyAsync(
        generatedAccessToken,
      );
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new BadRequestException('Refresh token expired');
      } else {
        throw new BadRequestException('Refresh token malformed');
      }
    }

    if (!decodedAccessToken) {
      throw new BadRequestException('Refresh token malformed');
    }

    return {
      token_type: 'Bearer',
      access_token: generatedAccessToken,
      expires_in: decodedAccessToken.exp,
    };
  }

  async generateRefreshToken(
    userDto: UserDto,
  ): Promise<GeneratedRefreshTokenDto> {
    const refreshToken = await this.refreshTokenService.create({
      user_id: userDto.user_id,
      expired_at: moment().utc().add(30, 'days').toISOString(),
    });

    const generatedRefreshToken = await this.jwtService.signAsync(
      {},
      {
        expiresIn: '30d',
        subject: refreshToken.user_id,
        jwtid: refreshToken.id,
      },
    );

    return {
      refresh_token: generatedRefreshToken,
    };
  }

  async resolveRefreshToken(refreshTokenDto: RefreshTokenDto) {
    let decodedRefreshToken = null;

    try {
      decodedRefreshToken = await this.jwtService.verifyAsync(
        refreshTokenDto.refresh_token,
      );
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new BadRequestException('Refresh token expired');
      } else {
        throw new BadRequestException('Refresh token malformed');
      }
    }

    if (!decodedRefreshToken.jti || !decodedRefreshToken.sub) {
      throw new BadRequestException('Refresh token malformed');
    }

    const refreshToken = await this.refreshTokenService.findOne({
      id: decodedRefreshToken.jti,
    });

    if (!refreshToken || refreshToken.is_revoked) {
      throw new BadRequestException('Refresh token expired');
    }

    //revoke access token expired
    if (
      moment(refreshToken.expired_at).utc().toISOString() <=
      moment().utc().toISOString()
    ) {
      await this.refreshTokenService.revoke({ id: refreshToken.id });
      throw new BadRequestException('Refresh token expired');
    }

    const user = await this.clientKafka
      .send('authLoginWithId', {
        id: decodedRefreshToken.sub,
      })
      .toPromise()
      .catch(clientRpcException);

    if (!user) {
      throw new BadRequestException('Refresh token malformed');
    }

    return { user, token: refreshToken };
  }
}
