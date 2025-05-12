import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../common/constants';
import { ClaimsKey as ClaimName } from '../jwt-auth/index';
import { Request } from '../common';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const Claims = createParamDecorator(
  (data: ClaimName, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getRequest();
    if (data) return request.claims?.[data];
    return request.claims;
  }
);
export const HasRole = (...roles: string[]) => SetMetadata('roles', roles);
