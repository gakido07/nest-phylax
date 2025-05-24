import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  Jwt,
  JWT_AUTH_MODULE_OPTIONS_TOKEN,
  PASSWORD_ENCODER_TOKEN,
  PasswordEncoder,
  USER_REPOSITORY_TOKEN,
  UserRepository,
} from '../../common';
import { PasswordLoginArgs } from './types';
import { JwtUtil } from '../jwt.util';
import { JwtGenerationOptions } from '../types';
import { AUTHENTICATION_FAILED_ERROR_MESSAGE } from '../jwt.auth.constants';

@Injectable()
export class JwtAuthService {
  constructor(
    @Inject(JWT_AUTH_MODULE_OPTIONS_TOKEN)
    private readonly options: JwtGenerationOptions,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_ENCODER_TOKEN)
    private readonly passwordEncoder: PasswordEncoder
  ) {}

  async passwordLogin({ email, password, config }: PasswordLoginArgs): Promise<{
    accessToken: Jwt;
    refreshToken?: Jwt;
  }> {
    email = email.toLowerCase();
    const user = await this.userRepository.findUserByUsername(email);
    if (!user) {
      throw new UnauthorizedException({
        message: 'Username or password is incorrect',
      });
    }
    if (!user.password) {
      throw new UnauthorizedException({
        message: 'Username or password is incorrect',
      });
    }
    const isPasswordValid = await this.passwordEncoder.compare(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        message: 'Username or password is incorrect',
      });
    }
    const jwtUtil = new JwtUtil();
    let refreshToken: Jwt | null = null;
    if (config?.generateRefreshToken) {
      if (!this.options.refreshTokenConfig) {
        throw new Error('Refresh token secret key is not set');
      }
      const refreshTokenString = jwtUtil.generateToken({
        user,
        secretKey: this?.options?.refreshTokenConfig?.secretKey,
        signOptions: {
          expiresIn: this?.options?.refreshTokenConfig?.expiresIn,
        },
      });
      refreshToken = {
        value: refreshTokenString,
        sub: user.id,
        role: await this.userRepository.getUserRole(user),
      };
      await this.userRepository.saveRefreshToken(refreshToken, user.id);
    }

    return {
      accessToken: {
        value: jwtUtil.generateToken({
          user,
          secretKey: this?.options?.accessTokenConfig?.secretKey,
          signOptions: {
            expiresIn: this?.options?.accessTokenConfig?.expiresIn || '1h',
          },
        }),
        sub: user.id,
        role: await this.userRepository.getUserRole(user),
      },
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    const jwtUtil = new JwtUtil();
    const decoded = jwtUtil.verifyJwt(
      refreshToken,
      this?.options?.refreshTokenConfig?.secretKey
    );
    if (!decoded?.sub) {
      throw new UnauthorizedException({
        message: 'Invalid refresh token',
      });
    }
    const user = await this.userRepository.findUserByUsername(
      decoded?.sub?.toString()
    );
    if (!user) {
      throw new UnauthorizedException({
        message: AUTHENTICATION_FAILED_ERROR_MESSAGE,
      });
    }
    const refreshTokens = user?.getRefreshTokens?.();
    if (!refreshTokens) {
      throw new UnauthorizedException({
        message: AUTHENTICATION_FAILED_ERROR_MESSAGE,
      });
    }
    const refreshTokenObj = refreshTokens.find(
      token => decoded?.jti === token?.jti
    );
    if (!refreshTokenObj) {
      throw new UnauthorizedException({
        message: AUTHENTICATION_FAILED_ERROR_MESSAGE,
      });
    }
    return {
      accessToken: {
        value: jwtUtil.generateToken({
          user,
          secretKey: this?.options?.accessTokenConfig?.secretKey,
          signOptions: {
            expiresIn: this?.options?.accessTokenConfig?.expiresIn || '1h',
          },
        }),
        sub: user.id,
        role: await this.userRepository.getUserRole(user),
      },
    };
  }
}
