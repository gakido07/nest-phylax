import { DynamicModule, Module, Type } from '@nestjs/common';
import { JwtAuthModuleOptions, JwtGenerationOptions } from './types';
import { RefreshTokenController, PasswordLoginController } from './controllers';
import { JwtAuthService } from './services/jwt.auth.service';
import {
  JWT_AUTH_MODULE_OPTIONS_TOKEN,
  JWT_GENERATION_OPTIONS_TOKEN,
  PASSWORD_ENCODER_TOKEN,
  USER_REPOSITORY_TOKEN,
} from '../common';
import { JwtAuthGuard } from './guards';

@Module({})
export class JwtAuthModule {
  static forRoot(
    options: JwtAuthModuleOptions & JwtGenerationOptions
  ): DynamicModule {
    if (!options.accessTokenConfig) {
      throw new Error('accessTokenConfig is required');
    }
    let controllers: Type<any>[] = [];
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
          useValue: {
            disableControllers: options?.disableControllers,
            accessTokenConfig: options.accessTokenConfig,
            refreshTokenConfig: options?.refreshTokenConfig,
          },
        },
        {
          provide: JWT_GENERATION_OPTIONS_TOKEN,
          useValue: {
            accessTokenConfig: options.accessTokenConfig,
            refreshTokenConfig: options?.refreshTokenConfig,
          },
        },
        {
          provide: USER_REPOSITORY_TOKEN,
          ...options.userRepositoryProvider,
        },
        {
          provide: PASSWORD_ENCODER_TOKEN,
          ...options.passwordEncoderProvider,
        },
        JwtAuthGuard,
        JwtAuthService,
      ],
      controllers,
      exports: [
        JwtAuthService,
        JwtAuthGuard,
        {
          provide: JWT_AUTH_MODULE_OPTIONS_TOKEN,
          useValue: options,
        },
        {
          provide: PASSWORD_ENCODER_TOKEN,
          useValue: options.passwordEncoderProvider,
        },
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: options.userRepositoryProvider,
        },
      ],
    };
  }
}
