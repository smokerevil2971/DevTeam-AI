import crypto from 'crypto';

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a token with expiry timestamp
 */
export function generateTokenWithExpiry(expiresInMinutes: number = 60): {
  token: string;
  expires: Date;
} {
  const token = generateToken();
  const expires = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  return { token, expires };
}

/**
 * Hash a token for secure storage
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a token against its hash
 */
export function verifyToken(token: string, hash: string): boolean {
  const tokenHash = hashToken(token);
  return crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hash));
}
