/**
 * Account Settings DTO
 * Data transfer objects for account-level settings
 */

// Individual setting document structure
export interface AccountSettingDocument {
  name: string;           // Setting key, e.g., 'aiStudioProxyFlow'
  label: string;          // Human-readable label
  accountId: string;      // LP Account ID
  value: string;          // Setting value
  createdAt: number;      // Timestamp
  createdBy: string;      // User ID who created
  updatedAt: number;      // Timestamp
  updatedBy: string;      // User ID who last updated
}

// Account-level settings collection
export class AccountSettingsDTO {
  static collectionName = 'account_settings';
}
