import { Type } from '@nestjs/common';
import { ClaimsDto } from '../jwt-auth/';

export type Request = {
  headers: {
    authorization: string;
  };
  claims: ClaimsDto;
};

export class Jwt {
  /**
   * The JWT value
   */
  value: string;
  /**
   * The subject of the JWT
   */
  sub: string | number;
  /**
   * The JWT ID
   */
  jti?: string;
  /**
   * The role of the JWT
   */
  role: string;
}

export class JwtDatabaseModel {
  jti: string;
  exp: string;
  sub: string;
}

export type RefreshTokenRecord = Omit<ClaimsDto, 'role'>;

export interface User {
  id: string;
  password?: string;
  getUsername(): string;
  getRefreshTokens?(): Jwt[];
}

export interface UserRepository {
  /**
   * override this method to find a user by their id or email
   */
  findOneById(id: string | number): Promise<User>;
  /**
   * Save a refresh token for a user
   * @param refreshToken - The refresh token
   * @param userId - The user id
   */
  saveRefreshToken(refreshToken: Jwt, userId: string): Promise<void>;

  /**
   * This is done to give flexibility to the user repository
   * to return the role of a user as relying on the user object might not be possible depending on the * implementation
   */
  getUserRole(user: User): Promise<string>;

  findUserByUsername(username: string): Promise<User>;
}

export interface PasswordEncoder {
  /**
   * Encode a password
   * @param password - The password to encode
   * @returns The encoded password
   */
  encode(password: string): Promise<string>;
  /**
   * Compare a password
   * @param password - The password to compare
   * @param encodedPassword - The encoded password
   * @returns True if the password is correct, false otherwise
   */
  compare(password: string, encodedPassword: string): Promise<boolean>;
}

export type NestPhylaxProvider<T = any> =
  | NestPhylaxClassProvider<T>
  | NestPhylaxValueProvider<T>
  | NestPhylaxFactoryProvider<T>;

export interface NestPhylaxClassProvider<T = any> {
  useClass: Type<T>;
}

export interface NestPhylaxValueProvider<T = any> {
  useValue: T;
}

export interface NestPhylaxFactoryProvider<T = any> {
  useFactory: (...args: any[]) => T | Promise<T>;
}
