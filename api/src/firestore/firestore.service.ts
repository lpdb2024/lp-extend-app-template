import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { CollectionReference } from '@google-cloud/firestore';
import { ForbiddenException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { AppAuthRequest, AppUserDto, CCUserDto, Token } from 'src/Controllers/CCIDP/cc-idp.dto';
import { accountCache } from 'src/utils/memCache';
import { UserDto, ApiKeyDto, ApplicationSettingsDto } from 'src/Controllers/AccountConfig/account-config.dto';
import { helper } from 'src/utils/HelperService';
// import { FirestoreCollectionProviders } from 'src/firestore/firestore.providers';
const { ctx } = helper;
@Injectable()
export class DBService {

  constructor(
    @InjectPinoLogger(DBService.name)
    private readonly logger: PinoLogger,
    @Inject(CCUserDto.collectionName)
    private userCollection: CollectionReference<AppUserDto>,
    @Inject(Token.collectionName)
    private tokenCollection: CollectionReference<Token>,
    @Inject(ApplicationSettingsDto.collectionName)
    private applicationSettingsCollection: CollectionReference<ApplicationSettingsDto>,
  ) {}
  
  async setUser (id: string, user: AppUserDto): Promise<AppUserDto> {
    try {
      this.logger.info(`setUser - id: ${id}, user keys: ${Object.keys(user).join(', ')}`);

      // Clean the user object - remove undefined values which Firestore doesn't accept
      const cleanUser = Object.fromEntries(
        Object.entries(user).filter(([_, v]) => v !== undefined)
      ) as AppUserDto;

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

  async getUser (id: string): Promise<AppUserDto | null> {
    try {
      const userDoc = await this.userCollection.doc(id).get();
      if (userDoc.exists) {
        return userDoc.data() as AppUserDto;
      }
      return null;
    } catch (error) {
      this.logger.error('Error getting user:', error);
      throw new InternalServerErrorException('Error getting user');
    }
  }

  async setToken (
    id: string,
    token: Token
  ): Promise<Token> {
    try {
      const tokenDoc = await this.tokenCollection.doc(id).get();
      if (tokenDoc.exists) {
        await this.tokenCollection.doc(id).update({ ...token });
      } else {
        await this.tokenCollection.doc(id).set(token);
      }
      accountCache
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