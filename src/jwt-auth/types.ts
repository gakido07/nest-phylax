import { PasswordEncoder } from '../common';

import { UserRepository } from '../common';

import { NestPhylaxProvider } from '../common';

type Unit =
  | 'Years'
  | 'Year'
  | 'Yrs'
  | 'Yr'
  | 'Y'
  | 'Weeks'
  | 'Week'
  | 'W'
  | 'Days'
  | 'Day'
  | 'D'
  | 'Hours'
  | 'Hour'
  | 'Hrs'
  | 'Hr'
  | 'H'
  | 'Minutes'
  | 'Minute'
  | 'Mins'
  | 'Min'
  | 'M'
  | 'Seconds'
  | 'Second'
  | 'Secs'
  | 'Sec'
  | 's'
  | 'Milliseconds'
  | 'Millisecond'
  | 'Msecs'
  | 'Msec'
  | 'Ms';

type UnitAnyCase = Unit | Uppercase<Unit> | Lowercase<Unit>;

export interface TokenConfig {
  secretKey: string;
  expiresIn: StringValue;
}

type StringValue =
  | `${number}`
  | `${number}${UnitAnyCase}`
  | `${number} ${UnitAnyCase}`;

export class PasswordLoginDto {
  email: string;
  password: string;
}

export interface JwtGenerationOptions {
  accessTokenConfig: TokenConfig;
  refreshTokenConfig?: TokenConfig;
}

export type JwtGenerationOptionsProvider =
  NestPhylaxProvider<JwtGenerationOptions>;

export interface JwtAuthModuleOptions {
  userRepositoryProvider: NestPhylaxProvider<UserRepository>;
  passwordEncoderProvider: NestPhylaxProvider<PasswordEncoder>;
  disableControllers?: boolean;
}
