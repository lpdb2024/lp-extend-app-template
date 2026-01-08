/**
 * Shell Token Service
 *
 * Verifies JWT tokens issued by the parent shell application.
 * These tokens are used when this app runs as a child inside LP Extend shell.
 */

import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export interface ShellTokenPayload {
  sub: string; // User ID (Firebase UID from parent shell)
  appId: string; // Child app ID
  accountId: string; // LP account ID
  scopes: string[]; // Granted permissions
  iat: number; // Issued at (Unix seconds)
  exp: number; // Expiration (Unix seconds)
  type: 'app_token'; // Token type marker
}

export interface ShellTokenVerificationResult {
  valid: boolean;
  payload?: ShellTokenPayload;
  error?: string;
}

@Injectable()
export class ShellTokenService {
  private readonly jwtSecret: string;

  constructor() {
    // Must match SHELL_JWT_SECRET from the parent shell
    this.jwtSecret = process.env.SHELL_JWT_SECRET;
    if (!this.jwtSecret) {
      console.warn(
        '[ShellTokenService] SHELL_JWT_SECRET not set - shell token verification will fail',
      );
    }
  }

  /**
   * Verify a shell token and extract payload
   */
  verifyToken(token: string): ShellTokenVerificationResult {
    if (!this.jwtSecret) {
      return { valid: false, error: 'Shell JWT secret not configured' };
    }

    try {
      const payload = jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256'],
      }) as ShellTokenPayload;

      // Verify it's an app token from the shell
      if (payload.type !== 'app_token') {
        return { valid: false, error: 'Invalid token type' };
      }

      return { valid: true, payload };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Token expired' };
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, error: 'Invalid token' };
      }
      return { valid: false, error: 'Token verification failed' };
    }
  }

  /**
   * Check if token has a specific scope
   */
  hasScope(payload: ShellTokenPayload, requiredScope: string): boolean {
    const { scopes } = payload;

    // Wildcard grants all
    if (scopes.includes('*')) return true;

    // Exact match
    if (scopes.includes(requiredScope)) return true;

    // Prefix match (e.g., 'skills:*' allows 'skills:read')
    const requiredParts = requiredScope.split(':');
    return scopes.some((scope) => {
      const parts = scope.split(':');
      return parts[0] === requiredParts[0] && parts[1] === '*';
    });
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): ShellTokenPayload | null {
    try {
      return jwt.decode(token) as ShellTokenPayload;
    } catch {
      return null;
    }
  }
}
