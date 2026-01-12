/**
 * ExtendJWT Service
 *
 * Verifies encrypted JWTs from the LP Extend Shell.
 * This allows child apps to validate the extend_auth cookie
 * set by the shell for seamless authentication.
 *
 * IMPORTANT: The EXTEND_JWT_SECRET and EXTEND_ENCRYPTION_KEY must match
 * the values used by the shell backend.
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

/**
 * Payload stored in the ExtendJWT (encrypted)
 */
export interface ExtendJWTPayload {
  // LP Auth
  lpAccessToken: string;
  lpUserId: string;
  lpAccountId: string;
  isLPA: boolean;

  // Conversation Builder Auth (optional)
  cbToken?: string;
  cbOrg?: string;

  // Proactive Auth (future)
  proactiveJwt?: string;

  // Session metadata
  expiresAt: number; // Unix timestamp ms
  createdAt: number;
}

/**
 * Decoded JWT structure (what we sign)
 */
interface ExtendJWTClaims {
  // Encrypted payload
  data: string;
  // IV for decryption
  iv: string;
  // Standard JWT claims
  sub: string; // User ID (for logging, not used for auth)
  iss: string;
  iat: number;
  exp: number;
}

// Constants - must match shell
const JWT_ISSUER = 'lp-extend-shell';
const ALGORITHM = 'aes-256-gcm';

// Cookie name - must match shell
export const EXTEND_AUTH_COOKIE = 'extend_auth';

@Injectable()
export class ExtendJWTService {
  private readonly jwtSecret: string;
  private readonly encryptionKey: Buffer;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    // JWT signing secret - must match shell
    const jwtSecretConfig = this.configService.get<string>('EXTEND_JWT_SECRET');
    if (jwtSecretConfig) {
      this.jwtSecret = jwtSecretConfig;
      this.enabled = true;
    } else {
      // Use default that matches shell's fallback for dev
      this.jwtSecret = 'extend-jwt-dev-secret-change-in-production-32chars!';
      this.enabled = true;
      console.warn(
        '[ExtendJWTService] EXTEND_JWT_SECRET not set - using dev fallback',
      );
    }

    // Encryption key (must be 32 bytes for AES-256) - must match shell
    const encryptionKeyStr = this.configService.get<string>(
      'EXTEND_ENCRYPTION_KEY',
    );
    if (encryptionKeyStr && encryptionKeyStr.length >= 32) {
      this.encryptionKey = Buffer.from(encryptionKeyStr.slice(0, 32));
    } else {
      // Use default that matches shell's fallback for dev
      this.encryptionKey = Buffer.from(
        'extend-encryption-key-32-chars!!',
      );
      console.warn(
        '[ExtendJWTService] EXTEND_ENCRYPTION_KEY not set - using dev fallback',
      );
    }
  }

  /**
   * Check if ExtendJWT verification is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Verify and decrypt an ExtendJWT
   * Returns the decrypted payload or null if invalid
   */
  verifyExtendJWT(token: string): ExtendJWTPayload | null {
    if (!token) {
      return null;
    }

    try {
      // Verify JWT signature and decode
      const decoded = jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256'],
        issuer: JWT_ISSUER,
      }) as ExtendJWTClaims;

      // Extract encrypted data and auth tag
      const [encrypted, authTag] = decoded.data.split('.');
      if (!encrypted || !authTag) {
        console.warn('[ExtendJWTService] Invalid token format - missing data or authTag');
        return null;
      }

      // Decrypt the payload
      const decrypted = this.decrypt(encrypted, decoded.iv, authTag);
      const payload = JSON.parse(decrypted) as ExtendJWTPayload;

      // Check if payload has expired (additional check beyond JWT exp)
      if (payload.expiresAt < Date.now()) {
        console.info('[ExtendJWTService] Token payload expired');
        return null;
      }

      console.info('[ExtendJWTService] ExtendJWT verified successfully', {
        userId: payload.lpUserId,
        accountId: payload.lpAccountId,
      });

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.debug('[ExtendJWTService] Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.debug('[ExtendJWTService] Invalid token:', error.message);
      } else {
        console.error('[ExtendJWTService] Token verification failed:', error.message);
      }
      return null;
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  private decrypt(encrypted: string, ivBase64: string, authTagBase64: string): string {
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    const decipher = crypto.createDecipheriv(ALGORITHM, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
