/**
 * Account Settings Service
 * Handles account-level settings stored in Firestore
 * Each setting is a separate document with metadata
 */

import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CollectionReference } from '@google-cloud/firestore';
import { AccountSettingsDTO, AccountSettingDocument } from './account-settings.dto';

@Injectable()
export class AccountSettingsService {
  constructor(
    @InjectPinoLogger(AccountSettingsService.name)
    private readonly logger: PinoLogger,
    @Inject(AccountSettingsDTO.collectionName)
    private accountSettingsCollection: CollectionReference<AccountSettingDocument>,
  ) {
    this.logger.setContext(AccountSettingsService.name);
  }

  /**
   * Get all settings for an account
   */
  async getAccountSettings(accountId: string): Promise<AccountSettingDocument[]> {
    const fn = 'getAccountSettings';
    try {
      const snapshot = await this.accountSettingsCollection
        .where('accountId', '==', accountId)
        .get();

      if (snapshot.empty) {
        this.logger.info({ fn, accountId }, 'No settings found for account');
        return [];
      }

      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
      this.logger.error({ fn, accountId, error }, 'Failed to get account settings');
      throw new InternalServerErrorException('Failed to retrieve account settings');
    }
  }

  /**
   * Get a specific setting by name for an account
   */
  async getSettingByName(accountId: string, name: string): Promise<AccountSettingDocument | null> {
    const fn = 'getSettingByName';
    try {
      const snapshot = await this.accountSettingsCollection
        .where('accountId', '==', accountId)
        .where('name', '==', name)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { ...doc.data(), id: doc.id } as AccountSettingDocument & { id: string };
    } catch (error) {
      this.logger.error({ fn, accountId, name, error }, 'Failed to get setting');
      throw new InternalServerErrorException('Failed to retrieve setting');
    }
  }

  /**
   * Create or update a setting
   */
  async upsertSetting(
    accountId: string,
    name: string,
    label: string,
    value: string,
    userId: string,
  ): Promise<AccountSettingDocument> {
    const fn = 'upsertSetting';
    try {
      // Check if setting already exists
      const existing = await this.getSettingByName(accountId, name);
      const now = Date.now();

      if (existing) {
        // Update existing
        const docId = (existing as any).id;
        const updatedData: Partial<AccountSettingDocument> = {
          value,
          updatedAt: now,
          updatedBy: userId,
        };

        await this.accountSettingsCollection.doc(docId).update(updatedData);

        this.logger.info({ fn, accountId, name }, 'Setting updated');
        return { ...existing, ...updatedData };
      } else {
        // Create new
        const newSetting: AccountSettingDocument = {
          name,
          label,
          accountId,
          value,
          createdAt: now,
          createdBy: userId,
          updatedAt: now,
          updatedBy: userId,
        };

        const docRef = await this.accountSettingsCollection.add(newSetting as any);

        this.logger.info({ fn, accountId, name, docId: docRef.id }, 'Setting created');
        return { ...newSetting, id: docRef.id } as any;
      }
    } catch (error) {
      this.logger.error({ fn, accountId, name, error }, 'Failed to upsert setting');
      throw new InternalServerErrorException('Failed to save setting');
    }
  }

  /**
   * Delete a setting
   */
  async deleteSetting(accountId: string, name: string): Promise<void> {
    const fn = 'deleteSetting';
    try {
      const existing = await this.getSettingByName(accountId, name);
      if (existing) {
        const docId = (existing as any).id;
        await this.accountSettingsCollection.doc(docId).delete();
        this.logger.info({ fn, accountId, name }, 'Setting deleted');
      }
    } catch (error) {
      this.logger.error({ fn, accountId, name, error }, 'Failed to delete setting');
      throw new InternalServerErrorException('Failed to delete setting');
    }
  }
}
