import { createHash } from 'crypto';

export function createSha256Hash(rawText: string) {
  return createHash('sha256').update(rawText).digest('hex');
}
