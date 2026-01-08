/**
 * User Settings Service
 * Handles user-level settings stored in Firestore
 */

import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CollectionReference } from '@google-cloud/firestore';
import { UserSettingsDTO } from '../AccountConfig/account-config.dto';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectPinoLogger(UserSettingsService.name)
    private readonly logger: PinoLogger,
    @Inject(UserSettingsDTO.collectionName)
    private userSettingsCollection: CollectionReference<UserSettingsDTO>,
  ) {
    this.logger.setContext(UserSettingsService.name);
  }

  /**
   * Get user settings by Firebase UID
   */
  async getUserSettings(userId: string): Promise<UserSettingsDTO | null> {
    const fn = 'getUserSettings';
    try {
      const doc = await this.userSettingsCollection.doc(userId).get();
      if (!doc.exists) {
        this.logger.info({ fn, userId }, 'No settings found for user');
        return null;
      }
      return doc.data() as UserSettingsDTO;
    } catch (error) {
      this.logger.error({ fn, userId, error }, 'Failed to get user settings');
      throw new InternalServerErrorException('Failed to retrieve user settings');
    }
  }

  /**
   * Update user settings (atomic merge)
   */
  async updateUserSettings(
    userId: string,
    settings: Partial<UserSettingsDTO>,
  ): Promise<UserSettingsDTO> {
    const fn = 'updateUserSettings';
    try {
      const docRef = this.userSettingsCollection.doc(userId);
      const doc = await docRef.get();
      const existingData = doc.exists ? (doc.data() as UserSettingsDTO) : {};

      // Deep merge for nested objects like github
      const updatedData = this.deepMerge(existingData, settings);

      await docRef.set(updatedData, { merge: true });

      this.logger.info({ fn, userId }, 'User settings updated');
      return updatedData as UserSettingsDTO;
    } catch (error) {
      this.logger.error({ fn, userId, error }, 'Failed to update user settings');
      throw new InternalServerErrorException('Failed to update user settings');
    }
  }

  /**
   * Deep merge utility for nested settings objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] !== undefined) {
        if (
          source[key] !== null &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key]) &&
          target[key] !== null &&
          typeof target[key] === 'object' &&
          !Array.isArray(target[key])
        ) {
          result[key] = this.deepMerge(target[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }
}
