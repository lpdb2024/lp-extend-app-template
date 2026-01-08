import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
const crypto = require('crypto');
import { cache, accountCache } from 'src/utils/memCache';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

import { BaseUriDto } from './helper-service.interfaces.dto';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { APIService } from '../APIService/api-service';
import { CCUI_ZONES } from 'src/constants/constants';
const context = '[HelperService]';

interface AppJwtResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

const CCUI_ZONE = process.env.CCUI_ZONE || CCUI_ZONES.AU

@Injectable()
export class HelperService {
  password = process.env.SALT_TOKEN;
  algorithm = 'aes-256-ctr';
  iv = randomBytes(16);

  constructor(
    @InjectPinoLogger(HelperService.name)
    private readonly logger: PinoLogger,
    private readonly apiService: APIService,
  ) {
    this.logger.setContext(context);
  }

  /* helper to get zone, region, etc for legacy domains */
  getLegacyDomainInfo ()  {
      const ref = {
        AU: { zone: 'z3', region: 'sy', geo: 'p-au' },
        EU: { zone: 'z2', region: 'lo', geo: 'p-eu' },
        US: { zone: 'z1', region: 'va', geo: 'p-us' },
      };
      return ref[CCUI_ZONE as keyof typeof ref];
  }

  async getDomains(accountId: string): Promise<BaseUriDto[]> | null {
    
    try {
      if (!accountId) {
        this.logger.error({
          fn: 'getDomains',
          message: 'No accountId provided',
          accountId: accountId,
        });
        throw new InternalServerErrorException('No accountId provided');
      }
      const url = `https://api.liveperson.net/api/account/${accountId}/service/baseURI.json?version=1.0`;
      const { data } = await this.apiService.get<{ baseURIs: BaseUriDto[] }>(
        url,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const {
        zone, region, geo
      } = this.getLegacyDomainInfo();
      const domains: BaseUriDto[] = data.baseURIs;

      if (zone) {        
        const proactiveDomain = {
            account: accountId,
            service: 'proactive',
            baseURI: `proactive-messaging.${zone}.fs.liveperson.com`,
          } 
        const exists = domains.find((domain: BaseUriDto) => domain.service === 'proactive');
        if (!exists) {
          domains.push(proactiveDomain);
        }
        const CB_DOMAINS = [
          {
            account: accountId,
            service: 'aistudio',
            baseURI: `aistudio-${geo}.liveperson.net`,
          },
          {
            account: accountId,
            service: 'botlogs',
            baseURI: `${region}.bc-bot.liveperson.net`,
          },
          {
            account: accountId,
            service: 'bot',
            baseURI: `${region}.bc-bot.liveperson.net`,
          },
          {
            account: accountId,
            service: 'botPlatform',
            baseURI: `${region}.bc-platform.liveperson.net`,
          },
          {
            account: accountId,
            service: 'kb',
            baseURI: `${region}.bc-kb.liveperson.net`,
          },
          {
            account: accountId,
            service: 'context',
            baseURI: `${region}.context.liveperson.net`,
          },
          {
            account: accountId,
            service: 'recommendation',
            baseURI: `${zone}.askmaven.liveperson.net`,
          },
          {
            account: accountId,
            service: 'proactiveHandoff',
            baseURI: `${region}.handoff.liveperson.net`,
          },
          {
            account: accountId,
            service: 'proactive',
            baseURI: `proactive-messaging.${zone}.fs.liveperson.com`,
          },
          {
            account: accountId,
            service: 'convBuild',
            baseURI: `${region}.bc-sso.liveperson.net`,
          },
          {
            account: accountId,
            service: 'bcmgmt',
            baseURI: `${region}.bc-mgmt.liveperson.net`,
          },
          {
            account: accountId,
            service: 'bcintg',
            baseURI: `${region}.bc-intg.liveperson.net`,
          },
          {
            account: accountId,
            service: 'bcnlu',
            baseURI: `${region}.bc-nlu.liveperson.net`,
          },
        ];
        domains.push(...CB_DOMAINS);
      }
      cache.add('CSDS_' + region, domains, 3600);
      return domains;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  getCachedDomains(accountId: string): BaseUriDto[] | null {
    try {
      const map = cache.get('CSDS_MAP_' + accountId);
      if (map) {
        const domains = cache.get('CSDS_' + map.region);
        if (domains) {
          return domains;
        } else {
          return null;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear cached domains for an account (useful when domains change)
   */
  clearDomainCache(accountId: string): void {
    try {
      const map = cache.get('CSDS_MAP_' + accountId);
      if (map) {
        cache.delete('CSDS_' + map.region);
      }
      cache.delete('CSDS_MAP_' + accountId);
      this.logger.info({ accountId }, 'Domain cache cleared');
    } catch (error) {
      this.logger.error({ accountId, error }, 'Failed to clear domain cache');
    }
  }

  async getDomain(accountId: string, service: string): Promise<string | null> {
    try {
      const storedBaseURIs = this.getCachedDomains(accountId);
      const zoneMap = {
        va: 'z1',
        lo: 'z2',
        sy: 'z3',
      };
      const ais = {
        z3: 'p-au',
        z2: 'p-eu',
        z1: 'p-us',
      };
      if (!storedBaseURIs) {
        const domains = await this.getDomains(accountId);
        // console.info('domains', domains);
        const asyncMessagingEnt = domains.find(
          (domain: BaseUriDto) => domain.service === 'asyncMessagingEnt',
        );
        if (!asyncMessagingEnt) {
          this.logger.error(`asyncMessagingEnt domain not found for account ${accountId}`);
          throw new InternalServerErrorException(`asyncMessagingEnt domain not found for account ${accountId}`);
        }
        const region = asyncMessagingEnt.baseURI.split('.')[0];
        const geo = ais[zoneMap[region]];
        const zone = zoneMap[region];
        cache.add('CSDS_MAP_' + accountId, { zone, geo, region }, 3600);
        if (zone) {
          console.info('-----------------------------------------------')
          console.info('zone', zone);
          const proactiveDomain = {
              account: accountId,
              service: 'proactive',
              baseURI: `proactive-messaging.${zone}.fs.liveperson.com`,
            } 
          const exists = domains.find((domain: BaseUriDto) => domain.service === 'proactive');
          if (!exists) {
            domains.push(proactiveDomain);
          }
          const CB_DOMAINS = [
            // GET https://proactive-messaging.z3.fs.liveperson.com/api/campaigns?offset=0&limit=15
            {
              account: accountId,
              service: 'aistudio',
              baseURI: `aistudio-${geo}.liveperson.net`,
            },
            {
              account: accountId,
              service: 'botlogs',
              baseURI: `${region}.bc-bot.liveperson.net`,
            },
            {
              account: accountId,
              service: 'bot',
              baseURI: `${region}.bc-bot.liveperson.net`,
            },
            {
              account: accountId,
              service: 'botPlatform',
              baseURI: `${region}.bc-platform.liveperson.net`,
            },
            {
              account: accountId,
              service: 'kb',
              baseURI: `${region}.bc-kb.liveperson.net`,
            },
            {
              account: accountId,
              service: 'context',
              baseURI: `${region}.context.liveperson.net`,
            },
            {
              account: accountId,
              service: 'recommendation',
              baseURI: `${zone}.askmaven.liveperson.net`,
            },
            {
              account: accountId,
              service: 'proactiveHandoff',
              baseURI: `${region}.handoff.liveperson.net`,
            },
            {
              account: accountId,
              service: 'proactive',
              baseURI: `proactive-messaging.${zone}.fs.liveperson.com`,
            },
            {
              account: accountId,
              service: 'convBuild',
              baseURI: `${region}.bc-sso.liveperson.net`,
            },
            {
              account: accountId,
              service: 'bcmgmt',
              baseURI: `${region}.bc-mgmt.liveperson.net`,
            },
            {
              account: accountId,
              service: 'bcintg',
              baseURI: `${region}.bc-intg.liveperson.net`,
            },
            {
              account: accountId,
              service: 'bcnlu',
              baseURI: `${region}.bc-nlu.liveperson.net`,
            },
          ];
          domains.push(...CB_DOMAINS);
        }
        const domain: BaseUriDto = domains.find(
          (domain: BaseUriDto) => domain.service === service,
        );
        if (!domain) {
          this.logger.error(`Domain not found for service ${service} in account ${accountId}`);
          return null;
        }
        return domain.baseURI;
      }
      const domain = storedBaseURIs.find(
        (domain: BaseUriDto) => domain.service === service,
      );
      if (!domain) {
        this.logger.error(`Domain not found for service ${service} in account ${accountId}`);
        return null;
      }
      return domain.baseURI;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  generateKey = async (password: string): Promise<Buffer> => {
    const salt = randomBytes(16).toString('hex');
    const derivedKey: Buffer = (await promisify(scrypt)(
      password,
      salt,
      32,
    )) as Buffer;
    return derivedKey;
  };

  async encrypt(textToEncrypt: string): Promise<any> {
    // const iv = randomBytes(16);
    const iv = Buffer.from('f80ace8efbf6019f083ed42389d7ad97', 'hex');

    // The key length is dependent on the algorithm.
    // In this case for aes256, it is 32 bytes.
    const password = process.env.SALT_TOKEN;
    // console.info('password', password);
    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, iv);
    const encryptedText = Buffer.concat([
      cipher.update(textToEncrypt),
      cipher.final(),
    ]);

    const decipher = createDecipheriv('aes-256-ctr', key, iv);
    const decryptedText = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);
    // console.info('decryptedText', decryptedText.toString());

    return encryptedText.toString('hex');
  }

  async decrypt(encryptedText: string) {
    const iv = Buffer.from('f80ace8efbf6019f083ed42389d7ad97', 'hex');
    const x = Buffer.from(encryptedText, 'hex');
    const password = process.env.SALT_TOKEN;
    // console.info('password', password);
    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
    const decipher = createDecipheriv('aes-256-ctr', key, iv);
    const decryptedText = Buffer.concat([decipher.update(x), decipher.final()]);
    return decryptedText.toString();
  }
  async encrypt1(textToEncrypt: string): Promise<any> {
    const key = await this.generateKey(this.password);
    const cipher = createCipheriv(this.algorithm, key, this.iv);
    const encrypted = Buffer.concat([
      cipher.update(textToEncrypt),
      cipher.final(),
    ]);
    return `${this.iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  async decrypt1(encryptedText: string) {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    const key = await this.generateKey(this.password);
    const decipher = createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(ivHex, 'hex'),
    );
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString();
  }

  async hash256(str: string): Promise<any> {
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  /**
   * Get an AppJWT token by exchanging client credentials
   * Uses the sentinel service to exchange client_id and client_secret for an access token
   * Results are cached per account and cache key prefix
   *
   * @param accountId - LP account ID
   * @param clientId - OAuth client ID
   * @param clientSecret - OAuth client secret
   * @param cacheKeyPrefix - Prefix for cache key (e.g., 'proactive', 'connector') to avoid collisions
   * @returns Access token string or null if failed
   */
  async getAppJwt(
    accountId: string,
    clientId: string,
    clientSecret: string,
    cacheKeyPrefix: string = 'app',
  ): Promise<string | null> {
    const fn = 'getAppJwt';
    try {
      // Check cache first
      const cacheKey = `${cacheKeyPrefix}_${accountId}_app_jwt`;
      const cachedAppJwt = accountCache(accountId).get(cacheKey);
      if (cachedAppJwt) {
        this.logger.debug({ fn, accountId, cacheKeyPrefix }, 'Returning cached AppJWT');
        return cachedAppJwt;
      }

      // Get sentinel domain
      const domain = await this.getDomain(accountId, 'sentinel');
      if (!domain) {
        this.logger.error({
          fn,
          message: 'Domain not found for service: sentinel',
          accountId,
        });
        return null;
      }

      // Exchange credentials for token
      const url = `https://${domain}/sentinel/api/account/${accountId}/app/token?v=1.0&grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`;

      const response = await this.apiService.post<AppJwtResponse>(
        url,
        {},
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const appJwt = response.data;
      const accessToken = appJwt.access_token;

      // Cache the token (use expires_in from response, with a small buffer)
      const ttlSeconds = Math.max(appJwt.expires_in - 60, 60); // At least 60 seconds, minus 1 minute buffer
      accountCache(accountId).add(cacheKey, accessToken, ttlSeconds);

      this.logger.info({
        fn,
        accountId,
        cacheKeyPrefix,
        expiresIn: appJwt.expires_in,
      }, 'AppJWT obtained and cached');

      return accessToken;
    } catch (error) {
      this.logger.error({
        fn,
        message: 'Error getting AppJWT',
        accountId,
        cacheKeyPrefix,
        error: error?.response?.data || error.message,
      });
      throw new InternalServerErrorException(
        `Error getting AppJWT for account ${accountId}: ${error?.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Clear cached AppJWT for an account
   * Useful when credentials change or token is invalidated
   */
  clearAppJwtCache(accountId: string, cacheKeyPrefix: string = 'app'): void {
    const cacheKey = `${cacheKeyPrefix}_${accountId}_app_jwt`;
    accountCache(accountId).delete(cacheKey);
    this.logger.info({ accountId, cacheKeyPrefix }, 'AppJWT cache cleared');
  }

  /**
   * Alternative AppJWT exchange - credentials in body, grant_type in URL
   * Based on older working implementation
   */
  async getAppJwtAlt(
    accountId: string,
    clientId: string,
    clientSecret: string,
    cacheKeyPrefix: string = 'app',
  ): Promise<string | null> {
    const fn = 'getAppJwtAlt';
    const cacheKey = `${cacheKeyPrefix}_alt_${accountId}_app_jwt`;

    // Check cache first
    const cachedToken = accountCache(accountId).get(cacheKey) as string | undefined;
    if (cachedToken) {
      this.logger.debug({ fn, accountId, cacheKeyPrefix }, 'Using cached AppJWT (alt)');
      return cachedToken;
    }

    try {
      const domain = await this.getDomain(accountId, 'sentinel');
      if (!domain) {
        this.logger.error({
          fn,
          message: 'Domain not found for service: sentinel',
          accountId,
        });
        return null;
      }

      // grant_type in URL, credentials in body
      const url = `https://${domain}/sentinel/api/account/${accountId}/app/token?v=1.0&grant_type=client_credentials`;
      const body = `client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`;

      const response = await this.apiService.post<AppJwtResponse>(
        url,
        body,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const appJwt = response.data;
      const accessToken = appJwt.access_token;

      // Cache the token
      const ttlSeconds = Math.max(appJwt.expires_in - 60, 60);
      accountCache(accountId).add(cacheKey, accessToken, ttlSeconds);

      this.logger.info({
        fn,
        accountId,
        cacheKeyPrefix,
        expiresIn: appJwt.expires_in,
      }, 'AppJWT (alt) obtained and cached');

      return accessToken;
    } catch (error) {
      this.logger.error({
        fn,
        message: 'Error getting AppJWT (alt)',
        accountId,
        cacheKeyPrefix,
        error: error?.response?.data || error.message,
      });
      throw new InternalServerErrorException(
        `Error getting AppJWT (alt) for account ${accountId}: ${error?.response?.data?.message || error.message}`,
      );
    }
  }
}
