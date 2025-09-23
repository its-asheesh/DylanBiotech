// src/utils/generateToken.ts
import jwt from 'jsonwebtoken';

// Access token (short-lived)
const generateAccessToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
};

// Refresh token (long-lived)
const generateRefreshToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '30d', // 30 days — only for "Remember Me"
  });
};

export { generateAccessToken, generateRefreshToken };