import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { clientRpcException } from '../../@core/helpers/exception-rpc.helper';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    @Inject('ACCOUNT_SERVICE')
    private readonly accountService: ClientProxy,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '99!@#AA#@!99',
    });
  }

  async validate(payload): Promise<any> {
    if (!payload.subject) {
      return null;
    }

    return await this.accountService
      .send('getAccount', { id: payload.subject })
      .toPromise()
      .catch(clientRpcException);
  }
}
