import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
} from '@nestjs/common';
import { JwtAuthService } from '../services/jwt.auth.service';
import { PasswordLoginDto } from '../types';
import { decode } from 'jsonwebtoken';

@Controller('/password-login')
export class PasswordLoginController {
  constructor(private readonly jwtAuthService: JwtAuthService) {}

  @Post()
  async passwordLogin(@Body() dto: PasswordLoginDto) {
    validatePasswordLoginDto(dto);
    const { accessToken, refreshToken } =
      await this.jwtAuthService.passwordLogin(dto);
    return {
      message: 'Login successful',
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  }
}

function validatePasswordLoginDto(dto: PasswordLoginDto) {
  if (!dto?.email) {
    throw new BadRequestException('Email is required');
  }
  if (!dto?.password) {
    throw new BadRequestException('Password is required');
  }
  if (typeof dto.email !== 'string') {
    throw new BadRequestException('Email must be a string');
  }
  if (typeof dto.password !== 'string') {
    throw new BadRequestException('Password must be a string');
  }
  if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(dto.email)) {
    throw new BadRequestException('Invalid email');
  }
}

@Controller('/refresh-token')
export class RefreshTokenController {
  constructor(private readonly jwtAuthService: JwtAuthService) {}

  @Post()
  async refreshToken(@Body() dto: { refreshToken: string }) {
    validateRefreshTokenDto(dto);
    const { accessToken } = await this.jwtAuthService.refreshToken(
      dto.refreshToken
    );
    return {
      message: 'Refresh token successful',
      data: {
        accessToken: accessToken,
      },
    };
  }
}

function validateRefreshTokenDto(dto: { refreshToken: string }) {
  if (!dto?.refreshToken) {
    throw new BadRequestException('Refresh token is required');
  }
  try {
    decode(dto.refreshToken);
  } catch (error) {
    throw new BadRequestException('Invalid refresh token');
  }
}
