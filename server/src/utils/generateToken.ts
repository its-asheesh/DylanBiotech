// src/utils/generateToken.ts
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { RefreshToken } from '../models/RefreshToken';
import { JWT_ACCESS_SECRET } from '../config/env';

/**
 * Securely hash a token for storage in the database.
 * Prevents exposure of raw tokens if DB is compromised.
 */
export const hashToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a cryptographically secure random token for refresh tokens.
 * Uses UUID v4 (122-bit entropy).
 */
export const generateSecureToken = (): string => {
  return uuidv4();
};

/**
 * Issue a new pair of access and refresh tokens.
 * - Access token: short-lived JWT (15 minutes)
 * - Refresh token: opaque, random string (30 days), stored hashed in DB
 *
 * @param userId - The user ID to embed in tokens
 * @returns Object containing access token and raw refresh token (for cookie)
 */
export const issueTokens = async (userId: string) => {
  // 🔑 Short-lived access token (15 minutes)
  const accessToken = jwt.sign(
    { id: userId },
    JWT_ACCESS_SECRET,
    {
      expiresIn: '15m',
      issuer: 'DylanBiotech',
      subject: userId,
    }
  );

  // 🔁 Long-lived opaque refresh token (30 days)
  const rawRefreshToken = generateSecureToken();
  const tokenHash = hashToken(rawRefreshToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // 💾 Store hashed refresh token in DB for revocation & validation
  await new RefreshToken({
    userId,
    tokenHash,
    expiresAt,
  }).save();

  return {
    accessToken,
    rawRefreshToken,
  };
};