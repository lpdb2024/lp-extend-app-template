/**
 * LivePerson Domain Resolution Service
 * Handles resolution of LP service domains via CSDS API
 */

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { APIService } from '../../APIService/api-service';
import { cache } from 'src/utils/memCache';
import { LP_SERVICE_DOMAINS } from './lp-constants';
import { ILPBaseUri, ILPDomainResponse } from './lp-common.interfaces';

const DOMAIN_API_BASE = 'https://api.liveperson.net';
const CACHE_TTL_SECONDS = 3600; // 1 hour
const CACHE_PREFIX_DOMAINS = 'LP_CSDS_';
const CACHE_PREFIX_MAP = 'LP_CSDS_MAP_';

/**
 * Region mapping for zone resolution
 */
const REGION_ZONE_MAP: Record<string, string> = {
  va: 'z1',
  lo: 'z2',
  sy: 'z3',
};

/**
 * Zone to geo mapping for AI services
 */
const ZONE_GEO_MAP: Record<string, string> = {
  z1: 'p-us',
  z2: 'p-eu',
  z3: 'p-au',
};

@Injectable()
export class LPDomainService {
  constructor(
    @InjectPinoLogger(LPDomainService.name)
    private readonly logger: PinoLogger,
    private readonly apiService: APIService,
  ) {
    this.logger.setContext(LPDomainService.name);
  }

  /**
   * Get all domains for an account
   * Results are cached for performance
   */
  async getDomains(accountId: string): Promise<ILPBaseUri[]> {
    try {
      if (!accountId) {
        this.logger.error({
          fn: 'getDomains',
          message: 'No accountId provided',
        });
        throw new InternalServerErrorException('No accountId provided');
      }

      const url = `${DOMAIN_API_BASE}/api/account/${accountId}/service/baseURI.json?version=1.0`;

      const { data } = await this.apiService.get<ILPDomainResponse>(url, {
        headers: { 'Content-Type': 'application/json' },
      });

      const domains: ILPBaseUri[] = data.baseURIs || [];

      // Determine region from asyncMessagingEnt domain
      const asyncMessagingEnt = domains.find(
        (d) => d.service === LP_SERVICE_DOMAINS.ASYNC_MESSAGING,
      );

      if (asyncMessagingEnt) {
        const region = asyncMessagingEnt.baseURI.split('.')[0];
        const zone = REGION_ZONE_MAP[region];
        const geo = ZONE_GEO_MAP[zone];

        // Cache region mapping for this account
        cache.add(CACHE_PREFIX_MAP + accountId, { zone, geo, region }, CACHE_TTL_SECONDS);

        // Add computed domains for CB/AI services
        const computedDomains = this.getComputedDomains(accountId, region, zone, geo);
        domains.push(...computedDomains);
      }

      // Cache all domains
      const cacheKey = this.getCacheKey(accountId);
      cache.add(cacheKey, domains, CACHE_TTL_SECONDS);

      return domains;
    } catch (error) {
      this.logger.error({
        fn: 'getDomains',
        message: 'Failed to get domains',
        accountId,
        error,
      });
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Get a specific domain for a service
   */
  async getDomain(
    accountId: string,
    service: LP_SERVICE_DOMAINS | string,
  ): Promise<string | null> {
    try {
      // Check cache first
      const cachedDomains = this.getCachedDomains(accountId);

      if (cachedDomains) {
        const domain = cachedDomains.find((d) => d.service === service);
        if (domain) {
          return domain.baseURI;
        }
      }

      // Fetch fresh domains
      const domains = await this.getDomains(accountId);
      const domain = domains.find((d) => d.service === service);

      if (!domain) {
        this.logger.warn({
          fn: 'getDomain',
          message: `Domain not found for service ${service}`,
          accountId,
        });
        return null;
      }

      return domain.baseURI;
    } catch (error) {
      this.logger.error({
        fn: 'getDomain',
        message: 'Failed to get domain',
        accountId,
        service,
        error,
      });
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Get cached domains for an account
   */
  private getCachedDomains(accountId: string): ILPBaseUri[] | null {
    try {
      const regionMap = cache.get(CACHE_PREFIX_MAP + accountId);
      if (regionMap) {
        const domains = cache.get(CACHE_PREFIX_DOMAINS + regionMap.region);
        if (domains) {
          return domains;
        }
      }

      const cacheKey = this.getCacheKey(accountId);
      return cache.get(cacheKey) || null;
    } catch {
      return null;
    }
  }

  /**
   * Generate cache key for account domains
   */
  private getCacheKey(accountId: string): string {
    return CACHE_PREFIX_DOMAINS + accountId;
  }

  /**
   * Get computed domains for CB/AI services based on region
   */
  private getComputedDomains(
    accountId: string,
    region: string,
    zone: string,
    geo: string,
  ): ILPBaseUri[] {
    return [
      {
        account: accountId,
        service: LP_SERVICE_DOMAINS.AI_STUDIO,
        baseURI: `aistudio-${geo}.liveperson.net`,
      },
      {
        account: accountId,
        service: LP_SERVICE_DOMAINS.BOT_LOGS,
        baseURI: `${region}.bc-bot.liveperson.net`,
      },
      {
        account: accountId,
        service: LP_SERVICE_DOMAINS.BOT,
        baseURI: `${region}.bc-bot.liveperson.net`,
      },
      {
        account: accountId,
        service: LP_SERVICE_DOMAINS.BOT_PLATFORM,
        baseURI: `${region}.bc-platform.liveperson.net`,
      },
      {
        account: accountId,
        service: LP_SERVICE_DOMAINS.KB,
        baseURI: `${region}.bc-kb.liveperson.net`,
      },
      {
        account: accountId,
        service: LP_SERVICE_DOMAINS.CONTEXT,
        baseURI: `${region}.context.liveperson.net`,
      },
      {
        account: accountId,
        service: LP_SERVICE_DOMAINS.RECOMMENDATION,
        baseURI: `${zone}.askmaven.liveperson.net`,
      },
      {
        account: accountId,
        service: LP_SERVICE_DOMAINS.PROACTIVE_HANDOFF,
        baseURI: `${region}.handoff.liveperson.net`,
      },
      {
        account: accountId,
        service: LP_SERVICE_DOMAINS.PROACTIVE,
        baseURI: `proactive-messaging.${zone}.fs.liveperson.com`,
      },
      {
        account: accountId,
        service: LP_SERVICE_DOMAINS.CB_SSO,
        baseURI: `${region}.bc-sso.liveperson.net`,
      },
      {
        account: accountId,
        service: LP_SERVICE_DOMAINS.CB_MGMT,
        baseURI: `${region}.bc-mgmt.liveperson.net`,
      },
      {
        account: accountId,
        service: LP_SERVICE_DOMAINS.CB_INTG,
        baseURI: `${region}.bc-intg.liveperson.net`,
      },
      {
        account: accountId,
        service: LP_SERVICE_DOMAINS.CB_NLU,
        baseURI: `${region}.bc-nlu.liveperson.net`,
      },
    ];
  }

  /**
   * Clear cached domains for an account
   */
  clearCache(accountId: string): void {
    const regionMap = cache.get(CACHE_PREFIX_MAP + accountId);
    if (regionMap) {
      cache.delete(CACHE_PREFIX_DOMAINS + regionMap.region);
    }
    cache.delete(CACHE_PREFIX_MAP + accountId);
    cache.delete(this.getCacheKey(accountId));
  }
}
