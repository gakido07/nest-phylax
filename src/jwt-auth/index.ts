export * from './jwt.util';
export * from './jwt.auth.module';
export * from './guards';
export * from './types';
export * from './services';
export * from './controllers';

export class ClaimsDto {
  sub: string | number;
  jti?: string;
  role: string;

  constructor({
    id,
    role,
    jti,
  }: {
    id: string | number;
    role: string;
    jti?: string;
  }) {
    this.sub = id;
    this.role = role;
    this.jti = jti;
  }
}

export type ClaimsKey = 'sub' | 'role' | 'jti' | 'exp' | 'iat';
