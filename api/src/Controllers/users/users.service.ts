import {
  Injectable,
  Inject,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { CollectionReference } from '@google-cloud/firestore';
import { UserData, UsersDocument, CredentialsDocument } from './users.interfaces';
import { ICredentials } from 'src/interfaces/interfaces';
import { HelperService } from 'src/Controllers/HelperService/helper-service.service';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
export const context = '[UsersService]';

@Injectable()
export class UsersService {
  constructor(
    @InjectPinoLogger(UsersService.name)
    private readonly logger: PinoLogger,
    @Inject(UsersDocument.collectionName)
    private usersCollection: CollectionReference<UsersDocument>,
    @Inject(CredentialsDocument.collectionName)
    private credentialsCollection: CollectionReference<CredentialsDocument>,
    private helperService: HelperService
  ) {
    this.logger.setContext(context);
  }

  async getUsers(accountId: string): Promise<UserData[]> | null {
    try {
      const snapshot = await this.usersCollection.where('account_id', '==', accountId).get();
      const users: UserData[] = [];
      snapshot.forEach((doc) => {
        users.push(doc.data() as UserData);
      });
      return users;
    } catch (error) {
      this.logger.error({
        fn: 'getUsers',
        message: 'Error getting users',
        error: error.message,
      });
      throw new InternalServerErrorException('Error getting users');
    }
  }

  async getUser(id: string): Promise<UserData> {
    try {
      const doc = await this.usersCollection.doc(id).get();
      return doc.data() as UserData;
    } catch (error) {
      this.logger.error({
        fn: 'getUser',
        message: `Error getting user with id ${id}`,
        error: error.message,
      });
      throw new InternalServerErrorException(`Error getting user with id ${id}`);
    }
  }

  async getCredentials(accountId: string): Promise<ICredentials> | null {
    try {
      const snapshot = await this.credentialsCollection.where('account_id', '==', accountId).get();
      const credentials: ICredentials = {
        account_id: accountId
      };
      for (const doc of snapshot.docs) {
        const data = doc.data() as CredentialsDocument;
        for (const key in data) {
          if (key !== 'account_id') {
            const x = await this.helperService.decrypt(data[key]);
            try {
              credentials[key] = JSON.parse(x);
            } catch (error) {
              credentials[key] = x;
            }
          }
        }
      }
      return credentials;
    } catch (error) {
      this.logger.error({
        fn: 'getCredentials',
        message: `Error getting credentials for account ${accountId}`,
        error: error.message,
      });
      throw new InternalServerErrorException(`Error getting credentials for account ${accountId}`);
    }
  }

  async setCredentials(accountId: string, data: ICredentials): Promise<ICredentials> {
    try {
      const _credentials = await this.getCredentials(accountId);
      const credentials: ICredentials = {
        account_id: accountId
      }
      delete data.accountId
      for (const key in data) {
        const encryptedData = await this.helperService.encrypt(JSON.stringify(data[key]));
        credentials[key] = encryptedData
        _credentials[key] = data[key]
      }

      await this.credentialsCollection.doc(accountId).set({
        account_id: accountId,
        ...credentials
      });
      return _credentials;
    } catch (error) {
      this.logger.error({
        fn: 'setCredentials',
        message: `Error setting credentials for account ${accountId}`,
        error: error.message,
      });
      throw new InternalServerErrorException(`Error setting credentials for account ${accountId}`);
    }

  }

}
