import { AuthGuard } from '@nestjs/passport';
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../@core/decorators/is-public.decorator';
import { PERMISSION_KEY } from '../../@core/decorators/gate.decorator';

@Injectable()
export class JwtAuthStrategy extends AuthGuard('jwt') {
  private permissions;

  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(err, user) {
    if (!user) {
      throw new ForbiddenException();
    }

    //todo: validate permission in here

    // if (!this.permissions || user?.role?.is_special) {
    //   return user;
    // }
    // const userPermissions = user?.permissions || [];
    // if (userPermissions.includes(this.permission)) {
    //   return user;
    // }

    return user;

    throw new ForbiddenException();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const permissions = this.reflector.getAllAndOverride<string>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (permissions) {
      this.permissions = permissions;
    }

    return super.canActivate(context);
  }
}
