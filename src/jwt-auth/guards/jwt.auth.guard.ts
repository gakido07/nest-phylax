import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  IS_PUBLIC_KEY,
  JWT_AUTH_MODULE_OPTIONS_TOKEN,
} from '../../common/constants';
import { ClaimsDto, JwtGenerationOptions } from '..';
import { JwtUtil } from '../jwt.util';
import { Request } from '../../common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(JWT_AUTH_MODULE_OPTIONS_TOKEN)
    private options: JwtGenerationOptions
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublicArgs = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()]
    );
    const isPublic = !!isPublicArgs;
    const request: Request = context.switchToHttp().getRequest();
    if (isPublic) {
      return true;
    }
    let claims: ClaimsDto;
    try {
      const jwtUtil = new JwtUtil();
      const token = request.headers.authorization.split(' ')[1];
      const roleRequirement = this.reflector.get<string[]>(
        'roles',
        context.getHandler()
      );
      if (roleRequirement) {
        const role = claims?.role;
        if (!role) {
          throw new UnauthorizedException({
            message: 'Could not validate token',
          });
        }
        if (!roleRequirement.includes(role)) {
          throw new UnauthorizedException({
            message: 'Unauthorized',
            description: 'User does not have the required role',
          });
        }
      }
      claims = jwtUtil.verifyJwt(
        token,
        this?.options?.accessTokenConfig?.secretKey
      );
      request.claims = claims;
      return true;
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        description: 'Could not validate token',
      });
    }
  }
}
