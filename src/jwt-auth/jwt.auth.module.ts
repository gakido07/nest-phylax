import { DynamicModule, Module } from '@nestjs/common';
import { TokenConfig } from './types';
import { RefreshTokenController, PasswordLoginController } from './controllers';
import { JwtAuthService } from './services/jwt.auth.service';
import {
  PASSWORD_ENCODER_TOKEN,
  PasswordEncoder,
  USER_REPOSITORY_TOKEN,
  UserRepository,
} from '../common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards';

export interface JwtAuthModuleOptions {
  accessTokenConfig: TokenConfig;
  refreshTokenConfig?: TokenConfig;
  userRepository: UserRepository;
  passwordEncoder: PasswordEncoder;
  disableControllers?: boolean;
}

export const JWT_AUTH_MODULE_OPTIONS_TOKEN = 'JWT_AUTH_MODULE_OPTIONS_TOKEN';

@Module({
  providers: [JwtAuthService],
  exports: [JwtAuthService],
  controllers: [RefreshTokenController, PasswordLoginController],
})
export class JwtAuthModule {
  static forRoot(options: JwtAuthModuleOptions): DynamicModule {
    let controllers: any[] = [];
    if (!options.disableControllers) {
      if (options.refreshTokenConfig) {
        controllers = [RefreshTokenController, PasswordLoginController];
      } else {
        controllers = [PasswordLoginController];
      }
    }
    return {
      module: JwtAuthModule,
      providers: [
        {
          provide: JWT_AUTH_MODULE_OPTIONS_TOKEN,
          useValue: options,
        },
        JwtAuthService,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: options.userRepository,
        },
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
        {
          provide: PASSWORD_ENCODER_TOKEN,
          useValue: options.passwordEncoder,
        },
      ],
      controllers,
    };
  }
}
