import { UnauthorizedException } from '@nestjs/common';

export function handleAuthenticationError(error: Error) {
  if (error instanceof UnauthorizedException) {
  }
}
