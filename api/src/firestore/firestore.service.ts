import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { CollectionReference } from '@google-cloud/firestore';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import type { SentinelAppUser, SentinelToken } from '@lpextend/node-sdk';
import { helper } from 'src/utils/HelperService';

// Collection name constants
const APP_USERS_COLLECTION = 'app-users';
const LP_TOKENS_COLLECTION = 'lp-tokens';
const APP_SETTINGS_COLLECTION = 'app-settings';

/**
 * Application settings stored in Firestore
 */
interface ApplicationSettingsDto {
  id?: string;
  accountId: string;
  settings: Record<string, any>;
  createdAt?: number;
  updatedAt?: number;
}

const { ctx } = helper;
@Injectable()
export class DBService {

  constructor(
    @InjectPinoLogger(DBService.name)
    private readonly logger: PinoLogger,
    @Inject(APP_USERS_COLLECTION)
    private userCollection: CollectionReference<SentinelAppUser>,
    @Inject(LP_TOKENS_COLLECTION)
    private tokenCollection: CollectionReference<SentinelToken>,
    @Inject(APP_SETTINGS_COLLECTION)
    private applicationSettingsCollection: CollectionReference<ApplicationSettingsDto>,
  ) {}
  
  async setUser (id: string, user: SentinelAppUser): Promise<SentinelAppUser> {
    try {
      this.logger.info(`setUser - id: ${id}, user keys: ${Object.keys(user).join(', ')}`);

      // Clean the user object - remove undefined values which Firestore doesn't accept
      const cleanUser = Object.fromEntries(
        Object.entries(user).filter(([_, v]) => v !== undefined)
      ) as SentinelAppUser;

      const existingUser = await this.userCollection.doc(id).get();
      if (existingUser.exists) {
        await this.userCollection.doc(id).update({ ...cleanUser });
      } else {
        await this.userCollection.doc(id).set(cleanUser);
      }
      return cleanUser;
    } catch (error) {
      this.logger.error(`Error setting user - id: ${id}, error: ${error?.message || error}`);
      this.logger.error(error);
      throw new InternalServerErrorException('Error setting user');
    }
  }

  async getUser (id: string): Promise<SentinelAppUser | null> {
    try {
      const userDoc = await this.userCollection.doc(id).get();
      if (userDoc.exists) {
        return userDoc.data() as SentinelAppUser;
      }
      return null;
    } catch (error) {
      this.logger.error('Error getting user:', error);
      throw new InternalServerErrorException('Error getting user');
    }
  }

  async setSentinelToken (
    id: string,
    token: SentinelToken
  ): Promise<SentinelToken> {
    try {
      const tokenDoc = await this.tokenCollection.doc(id).get();
      if (tokenDoc.exists) {
        await this.tokenCollection.doc(id).update({ ...token });
      } else {
        await this.tokenCollection.doc(id).set(token);
      }
      return token;
    } catch (error) {
      this.logger.error('Error setting token:', error);
      throw new InternalServerErrorException('Error setting token');
    }
  }

  async getApplicationSettingsAll(): Promise<ApplicationSettingsDto[]> {
    const fn = 'getAllApplicationSettings'
    try {
      const existing = await this.applicationSettingsCollection.get();
      const settings: ApplicationSettingsDto[] = [];
      existing.forEach((doc) => {
        const setting = doc.data() as ApplicationSettingsDto;
        if (setting) {
          settings.push(setting);
        }
      }
      );
      return settings;
    } catch (error) {
      this.logger.error({
        fn,
        error,
        message: 'Error getting all application settings'
      })
      throw new InternalServerErrorException(...ctx(DBService.name, fn, error));
    }
  }

}