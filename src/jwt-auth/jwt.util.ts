import { sign, SignOptions, verify } from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';
import { ClaimsDto } from '.';
import { User } from '../common';
import {
  FAILED_TO_DECODE_TOKEN_ERROR_MESSAGE,
  INVALID_TOKEN_SIGNATURE_ERROR_MESSAGE,
  TOKEN_EXPIRED_ERROR_MESSAGE,
} from './jwt.auth.constants';

export class JwtUtil {
  generateToken({
    user,
    claims,
    secretKey,
    signOptions,
  }: {
    user: User;
    claims?: ClaimsDto;
    signOptions?: SignOptions;
    secretKey?: string;
  }) {
    const secretKeyExists = !!secretKey;
    if (!secretKeyExists) {
      throw new Error('JWT_SECRET_KEY is not set');
    }
    return sign(
      {
        sub: user.id,
        role: claims?.role,
      },
      secretKey || process.env.JWT_SECRET_KEY,
      {
        ...signOptions,
        expiresIn: signOptions?.expiresIn || '1h',
      }
    );
  }

  /**
   * @description Verify a JWT token
   * @param token - The JWT token to verify
   * @param secretKey - The secret key to verify the token with
   * @returns The claims of the token
   */
  verifyJwt(token: string, secretKey: string): ClaimsDto {
    try {
      const decoded = verify(token, secretKey);
      return decoded as ClaimsDto;
    } catch (error) {
      switch (error.name) {
        case 'JsonWebTokenError':
          throw new UnauthorizedException({
            message: INVALID_TOKEN_SIGNATURE_ERROR_MESSAGE,
          });
        case 'TokenExpiredError':
          throw new UnauthorizedException({
            message: TOKEN_EXPIRED_ERROR_MESSAGE,
          });
        default:
          throw new UnauthorizedException({
            message: FAILED_TO_DECODE_TOKEN_ERROR_MESSAGE,
          });
      }
    }
  }
}
