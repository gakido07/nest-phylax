import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthService } from '../../src/jwt-auth/services/jwt.auth.service';
import { USER_REPOSITORY_MOCK } from '../__mocks__/user-mock';
import { sign } from 'jsonwebtoken';
import {
  INVALID_TOKEN_SIGNATURE_ERROR_MESSAGE,
  TOKEN_EXPIRED_ERROR_MESSAGE,
} from '../../src/jwt-auth/jwt.auth.constants';

describe('JwtAuthService', () => {
  let service: JwtAuthService = new JwtAuthService(
    {
      accessTokenConfig: {
        secretKey: 'secret',
        expiresIn: '1h',
      },
      refreshTokenConfig: {
        secretKey: 'secret',
        expiresIn: '1d',
      },
    },
    USER_REPOSITORY_MOCK,
    {
      encode: () => Promise.resolve('encoded'),
      compare: (password, encodedPassword) =>
        Promise.resolve(password === encodedPassword),
    }
  );

  describe('passwordLogin', () => {
    it('should return access token and refresh token', async () => {
      const result = await service.passwordLogin({
        email: 'mortysmith@gmail.com',
        password: 'morty_password',
      });
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('refreshToken', () => {
    it('should throw an unauthorized exception if the token is expired', async () => {
      const request = service.refreshToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmY2Y1YmI1Ny03NjQxLTRhNzAtYTEyMS05MTk0ZTlhYmM1MzAiLCJpYXQiOjE3NDY5MTk5NDAsImV4cCI6MTc0NjkyMzU0MH0.l5HXx1DEXnlDevgeYg-XPOunzOOGjziDlzv6oV9BEcE'
      );
      expect(request).rejects.toThrow(UnauthorizedException);
      await expect(request).rejects.toMatchObject({
        message: TOKEN_EXPIRED_ERROR_MESSAGE,
      });
    });

    it('should throw an unauthorized exception if the token is invalid', async () => {
      const invalidToken = sign({}, 'secresdfttg', {
        expiresIn: '1h',
      });
      const request = service.refreshToken(invalidToken);
      expect(request).rejects.toThrow(UnauthorizedException);
      await expect(request).rejects.toMatchObject({
        message: INVALID_TOKEN_SIGNATURE_ERROR_MESSAGE,
      });
    });
  });
});
