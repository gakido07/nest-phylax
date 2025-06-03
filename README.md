<p align="center">
  <a href="http://nestjs.com"><img alt="Nest Logo" src="https://nestjs.com/img/logo-small.svg" width="120"></a>
</p>

<h1 align="center">
  nest-phylax
</h1>

<p align="center">
  A <a href="https://github.com/nestjs/nest">Nest</a> based security module for authentication and authorization.
</p>

**Table of Contents**

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Module Configuration](#module-configuration)
- [Async Configuration](#async-configuration)
- [Security Decorators](#security-decorators)
- [JWT Utilities](#jwt-utilities)
- [API Reference](#api-reference)
- [Dependencies](#dependencies)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features

- JWT Authentication with role-based claims
- Security Decorators for route protection
- Claims extraction from JWT tokens
- Role-based access control
- Public route marking

## Installation

```bash
npm install --save nest-phylax jsonwebtoken @nestjs/passport

```

## Setup

### User Model

Phylax's jwt-auth module requires a user model to be provided. This model must implement the `User` interface. Here are examples for different database implementations:

#### Basic Implementation

```typescript
import { User as NpUser } from 'nest-phylax';

export class User implements NpUser {
  id: string;
  email: string;

  /**
   * Get the username of the user
   * @returns The username of the user
   *
   * This method is used to get the username of the user from the user object which is used to find the user in the database
   */
  getUsername(): string {
    return this.email;
  }
}
```

#### Mongoose Implementation

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User as NpUser } from 'nest-phylax';

@Schema()
export class User extends Document implements NpUser {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'user' })
  role: string;

  getUsername(): string {
    return this.email;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.getUsername = function () {
  return this.email;
};
```

#### TypeORM Implementation

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Type } from 'nest-phylax';

@Entity()
export class User implements NpUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  getUsername(): string {
    return this.email;
  }
}
```

### User Repository

The user repository is used to find the user in the database. It must implement the `UserRepository` interface. Here are examples for different database implementations:

#### Basic Implementation

```typescript
import { UserRepository } from 'nest-phylax';

export class UserRepository implements UserRepository {
  async findOneById(id: string): Promise<User> {
    // Logic to find the user by id
  }

  async getUserRole(user: User): Promise<string> {
    // Logic to get the role of the user
  }

  async getRefreshTokens(user: User): Promise<string[]> {
    // Logic to get the refresh tokens of the user
  }
}
```

#### Mongoose Implementation

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepository } from 'nest-phylax';
import { User } from './user.schema';

@Injectable()
export class UserRepository implements UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async findOneById(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }
}
```

#### TypeORM Implementation

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository as NpUserRepository } from 'nest-phylax';
import { User } from './user.entity';

@Injectable()
export class UserRepository implements NpUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  /**
   * Find a user by their ID
   * @param id The ID of the user to find
   * @returns The user with the given ID
   */
  async findOneById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * Get the role of a user
   * @param user The user to get the role of
   * @returns The role of the user
   *
   * This is added to the user repository to offer flexibility on how user roles are supplied to the jwt auth * guard
   */
  async getUserRole(user: User): Promise<string> {
    return user.role;
  }

  /**
   * Get the refresh tokens of a user
   * @param user The user to get the refresh tokens of
   * @returns The refresh tokens of the user
   */
  async getRefreshTokens(user: User): Promise<string[]> {
    return user.refreshTokens;
  }
}
```

### Password Encoder

The password encoder is used to encode and decode passwords. It must implement the `PasswordEncoder` interface. Here are examples for different password encoder implementations:

#### Basic Implementation

```typescript
import { PasswordEncoder } from 'nest-phylax';

export class PasswordEncoder implements PasswordEncoder {
  encode(password: string): Promise<string> {
    /**
     * Logic to encode the password and return a hash
     */
  }
  compare(password: string, hash: string): Promise<boolean> {
    /**
     * Logic to compare the password with the hash and return a boolean
     */
  }
}
```

Import the `JwtAuthModule` into the root `AppModule` and use the `forRoot()` method to configure it:

```typescript
import { Module } from '@nestjs/common';
import { JwtAuthModule } from 'nest-phylax';
import { UserRepository } from './user.repository';
import { PasswordEncoder } from './password.encoder';

@Module({
  imports: [
    JwtAuthModule.forRoot({
      accessTokenConfig: {
        secretKey: '{YOUR_SECRET_KEY}',
        expiresIn: '1h',
      },
      userRepositoryProvider: {
        useClass: UserRepository,
      },
      passwordEncoderProvider: {
        useClass: PasswordEncoder,
      },
    }),
  ],
})
export class AppModule {}
```

## Module Configuration

The `forRoot()` method accepts the following options:

```typescript
interface JwtAuthModuleOptions {
  /**
   * The configuration for the access token
   */
  accessTokenConfig: TokenConfig;
  /**
   * The provider for the user repository
   */
  userRepositoryProvider: Provider;
  /**
   * The provider for the password encoder
   */
  passwordEncoderProvider: Provider;
}
```

#### Token Config

```typescript
interface TokenConfig {
  /**
   * The secret key for the JWT token
   */
  secretKey: string;
  /**
   * The expiration time for the JWT token
   */
  expiresIn: StringValue;
}

type StringValue =
  | `${number}`
  | `${number}${UnitAnyCase}`
  | `${number} ${UnitAnyCase}`;

type UnitAnyCase = Unit | Uppercase<Unit> | Lowercase<Unit>;
```

String values can be in the following formats:

- `1h`
- `1d`
- `1w`
- `1m`
- `1y`

etc.

## Security Decorators

### Public Routes

```typescript
import { Public } from 'nest-phylax';

@Controller('api')
export class ApiController {
  @Public()
  @Get('public')
  getPublicData() {
    return { message: 'Anyone can see this' };
  }
}
```

### Role-Based Access

Nest Phylax offers a `HasRole` decorator to restrict access to specific roles. The roles have to be added to the jwt claims.

```typescript
import { HasRole, Claims } from 'nest-phylax';

@Controller('api')
export class ApiController {
  @HasRole('admin')
  @Get('admin')
  getAdminData(@Claims() claims) {
    return {
      message: 'Only admins can see this',
      user: claims.sub,
    };
  }
}
```

## JWT Utilities

### Token Generation

Nest phylax provides a wrapper around the `jsonwebtoken` library to generate and verify JWTs.

```typescript
import { JwtUtil, ClaimsDto } from 'nest-phylax';

@Injectable()
export class AuthService {
  constructor(private readonly jwtUtil: JwtUtil) {}

  generateToken(user: User) {
    return this.jwtUtil.generateToken({
      user,
      claims: new ClaimsDto({ id: user.id, role: user.role }),
    });
  }
}
```

### Token Verification

```typescript
@Injectable()
export class AuthService {
  verifyToken(token: string) {
    return this.jwtUtil.verifyJwt(token);
  }
}
```

## API Reference

### Decorators

| Decorator                   | Description                          |
| --------------------------- | ------------------------------------ |
| `@Public()`                 | Marks a route as publicly accessible |
| `@Claims()`                 | Extracts claims from the JWT token   |
| `@HasRole(roles: string[])` | Restricts access to specific roles   |

### JWT Utilities

```typescript
class JwtUtil {
  generateToken({
    user,
    claims,
    secretKey,
    signOptions,
  }: {
    user: User;
    claims?: ClaimsDto;
    secretKey?: string;
    signOptions?: SignOptions;
  }): string;

  verifyJwt(token: string, secretKey?: string): ClaimsDto;
}
```

## Dependencies

- @nestjs/common
- @nestjs/core
- @nestjs/platform-express
- jsonwebtoken

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

## License

This project is released under the terms of the [ISC License](LICENSE).

## Author

Konan
