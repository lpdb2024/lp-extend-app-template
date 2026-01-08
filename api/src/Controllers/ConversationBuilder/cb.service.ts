import {
  Injectable,
  Inject,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { HelperService } from '../HelperService/helper-service.service';
import { cache } from 'src/utils/memCache';
import { jwtDecode } from "jwt-decode";
import {
  AppAuthRequest,
  TokenDetails,
  Token,
  CBAuthInfoDto
} from './cb.dto'
import { CollectionReference } from '@google-cloud/firestore';
import { LpToken } from './cb.interfaces'
import { authenticate } from 'passport';

@Injectable()
export class ConversationBuilderService {  
  private logger: Logger = new Logger(ConversationBuilderService.name);

  constructor(
    @Inject(LpToken.collectionName)
    private tokenCollection: CollectionReference<LpToken>,
    private readonly httpService: HttpService,
    private readonly helperService: HelperService
  ) {}

  async authenticateConversationBuilder(site_id: string, authorization: string): Promise<CBAuthInfoDto | null> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'convBuild')
      const bearer = authorization.replace('Bearer ', '').replace('bearer ', '')
      if (!domain) {
        this.logger.error(`Domain not found for account ${site_id}`)
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }
      
      const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Type': 'application/json',
        'authorization': `Bearer ${bearer}`,
        'Connection': 'keep-alive'
      }
      const url = `https://${domain}/le-auth/sso/authenticate`
      const { data } = await firstValueFrom(
        this.httpService.get<CBAuthInfoDto>(url, {
          headers: headers
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw error;
          }),
        ),
      );
      if (!data) {
        this.logger.error(`Failed to authenticate user`)
        throw new InternalServerErrorException(`Failed to authenticate user`)
      }
      
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);      
    }
  }  
  async getBots(site_id: string, authorization: string, organizationid: string): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'botPlatform')
      
      if (!domain) {
        this.logger.error(`Domain not found for account ${site_id}`)
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }
      
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        authorization,
        organizationid
      }
      const url = `https://${domain}/bot-platform-manager-0.1/chatbots`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: headers
        }).pipe(
          catchError((error: AxiosError) => {
              this.logger.error(error.response);
              throw error;
              // throw {
              //   fn: 'getBots',
              //   status: error.response.status,
              //   statusText: error.response.statusText,
              //   data: error.response.data
              // }
            }),
        ),
      )
        
      if (!data) {
        this.logger.error(`Failed to get bots`)
        throw new InternalServerErrorException(`Failed to get bots`)
      }
      
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);      
    }
  }

  /*
  python version of getbotLogsFormatted
  def get_bot_logs(
        site_id: str,
        token: TokenDetails,
        user_id: str
        ):
    if use_logging:
        log.info(f"{CONTEXT} Getting bot logs for account: {site_id}")
    try:
        organizationid = token.cb_auth_token.organizationId
        authorization = token.cb_auth_token.authorization
        domain = get_stored_domain(site_id, "bot")
        if not domain:
            log.error(f"{CONTEXT} Domain not found for account {site_id}")
            raise NotFoundError("Domain not found for account")
        url = f"https://{domain}/botservice-0.1/botcentral/debugger/logFormatted?userId={user_id}"
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json; charset=utf-8",
            "authorization": authorization,
            "organizationid": organizationid,
            "Referer": "https://sy.botplatform.liveperson.net/",
            "Connection": "keep-alive",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site"
        }
        r = requests.get(url=url, headers=headers)
        response = r.json()
        return response
    except Exception as error:
        log.exception(f"{CONTEXT} Unexpected error {error}")
        # PrometheusMetrics.USERS_FAILURE.inc()
        raise InternalError(f"{error}") from error
    # PrometheusMetrics.USERS_SUCCESS.inc()

  */

    async getBotLogsFormatted (
      userId: string,
      authorization: string,
      organizationid: string
    ): Promise<any> {
      const url = `https://sy.bc-bot.liveperson.net/botservice-0.1/botcentral/debugger/v1/logFormatted?userId=${userId}&tags=ALL&client=ConversationTester`
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        authorization,
        organizationid
      }
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: headers
        }).pipe(
          catchError((error: AxiosError) => {
              console.error(error.response);
              throw error;
            }),
        ))
      return data;
    }

  // ============ Helper method for CB API calls ============
  private getCBHeaders(authorization: string, organizationid: string) {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      authorization,
      organizationid
    }
  }

  // ============ Bot Groups ============
  async getBotGroups(
    site_id: string,
    authorization: string,
    organizationid: string,
    page: number = 1,
    size: number = 100,
    expandAll: boolean = false
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbBotPlatform')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      // Use expand-all=true to include bots within each group
      const url = expandAll
        ? `https://${domain}/bot-groups?expand-all=true`
        : `https://${domain}/bot-groups?page=${page}&size=${size}`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getBotsByGroup(
    site_id: string,
    authorization: string,
    organizationid: string,
    botGroupId: string = 'un_assigned',
    sortBy: string = 'botName:asc',
    page: number = 1,
    size: number = 10
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbBotPlatform')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      // Use bot-group-id parameter (not bot-group) for actual group IDs
      // For 'un_assigned', use the special value directly
      const url = `https://${domain}/bot-groups/bots?sort-by=${sortBy}&page=${page}&size=${size}&bot-group-id=${botGroupId}`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // ============ Chatbot Details ============
  async getChatbotById(
    site_id: string,
    authorization: string,
    organizationid: string,
    chatBotId: string
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbBotPlatform')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/chatbots?chatBotId=${chatBotId}`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // ============ Dialogs ============
  async getDialogs(
    site_id: string,
    authorization: string,
    organizationid: string,
    botId: string
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbBotPlatform')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/bots/${botId}/dialog/`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // ============ Interactions ============
  async getInteractions(
    site_id: string,
    authorization: string,
    organizationid: string,
    botId: string
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbBotPlatform')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/chat/${botId}/interaction/`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // ============ Responders / Integrations ============
  async getResponders(
    site_id: string,
    authorization: string,
    organizationid: string,
    chatBotId: string
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbBotPlatform')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/responder?chatBotId=${chatBotId}`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // ============ NLU Domains ============
  async getNLUDomains(
    site_id: string,
    authorization: string,
    organizationid: string
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbIbc')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/api/cb/nlu/v1/domains/getByOrgId`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getDomainIntents(
    site_id: string,
    authorization: string,
    organizationid: string,
    domainId: string
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbIbc')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/api/cb/nlu/v1/domains/${domainId}/intents`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      // Wrap raw array response to be consistent with other endpoints
      if (Array.isArray(data)) {
        return { success: true, successResult: data }
      }
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // ============ Knowledge Base (KAI) ============
  async getKnowledgeBases(
    site_id: string,
    authorization: string,
    organizationid: string,
    includeMetrics: boolean = true
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbKb')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      this.logger.log({
        fn: 'getKnowledgeBases',
        site_id,
        domain,
        organizationid,
        authLength: authorization?.length,
        authFirst20: authorization?.substring(0, 20),
      });

      const url = `https://${domain}/knowledgeDataSource?includeMetrics=${includeMetrics}`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error({
              fn: 'getKnowledgeBases',
              url,
              status: error.response?.status,
              statusText: error.response?.statusText,
              data: error.response?.data,
            });
            throw error;
          }),
        ),
      )
      console.info('url', url);
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getKnowledgeBaseById(
    site_id: string,
    authorization: string,
    organizationid: string,
    kbId: string,
    includeMetrics: boolean = true
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbKb')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/knowledgeDataSource/${kbId}?includeMetrics=${includeMetrics}`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // ============ Bot Agent Management ============
  async getBotInstanceStatus(
    site_id: string,
    authorization: string,
    organizationid: string,
    botId: string
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbMonitoring')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/sysadmin/nodejs/instance/status-v2/${botId}`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async startBotAgent(
    site_id: string,
    authorization: string,
    organizationid: string,
    botId: string,
    lpAccountId: string,
    lpAccountUser: string
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbMonitoring')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/sysadmin/nodejs/instance/start/${botId}`
      const { data } = await firstValueFrom(
        this.httpService.put<any>(url, { lpAccountId, lpAccountUser }, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async stopBotAgent(
    site_id: string,
    authorization: string,
    organizationid: string,
    botId: string,
    lpAccountId: string,
    lpAccountUser: string
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbMonitoring')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/sysadmin/nodejs/instance/stop/${botId}`
      const { data } = await firstValueFrom(
        this.httpService.put<any>(url, { lpAccountId, lpAccountUser }, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getBotUsers(
    site_id: string,
    authorization: string,
    organizationid: string
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbExternalIntegrations')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/live-engage-service-0.1/le/accounts/${site_id}/bot_users`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async addBotAgent(
    site_id: string,
    authorization: string,
    organizationid: string,
    lpUserId: string,
    chatBotId: string,
    body: {
      deploymentEnvironment: string;
      type: string;
      configurations: any;
      lpAccountId: string;
      lpAccountUser: string;
      botId: string;
    }
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbExternalIntegrations')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/live-engage-service-0.1/le/accounts/${site_id}/bot_users/${lpUserId}?chatBotId=${chatBotId}`
      const { data } = await firstValueFrom(
        this.httpService.post<any>(url, body, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // ============ Global Functions ============
  async getGlobalFunctions(
    site_id: string,
    authorization: string,
    organizationid: string,
    botId: string
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbBotPlatform')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/bot/${botId}/globalFunctions`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // ============ Bot Environment ============
  async getBotEnvironment(
    site_id: string,
    authorization: string,
    organizationid: string
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbBotPlatform')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/auth/botenvironment/`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      // Wrap raw array response to be consistent with other endpoints
      if (Array.isArray(data)) {
        return { success: true, successResult: data }
      }
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // ============ LP Skills ============
  async getLPSkills(
    site_id: string,
    authorization: string,
    organizationid: string
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbExternalIntegrations')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/live-engage-service-0.1/le/accounts/${site_id}/skills`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // ============ Credentials ============
  async getCredentials(
    site_id: string,
    authorization: string,
    organizationid: string
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbExternalIntegrations')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/auth-service-0.1/credentials`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // ============ LP App Credentials ============
  async getLPAppCredentials(
    site_id: string,
    authorization: string,
    organizationid: string,
    chatBotId: string
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbBotPlatform')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/auth/liveperson/app?chatBotId=${chatBotId}`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // ============ Dialog Templates ============
  async getDialogTemplateSummary(
    site_id: string,
    authorization: string,
    organizationid: string
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbBotPlatform')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/dialog/template/summary`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // ============ Knowledge Base Content Sources ============
  async getKBContentSources(
    site_id: string,
    authorization: string,
    organizationid: string,
    kbId: string,
    includeKmsRecipeDetails: boolean = true
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbKb')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/kb/${kbId}/content_sources?includeKmsRecipeDetails=${includeKmsRecipeDetails}`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // ============ Knowledge Base Articles ============
  async getKBArticles(
    site_id: string,
    authorization: string,
    organizationid: string,
    kbId: string,
    page: number = 1,
    size: number = 20,
    sortAscByLastModificationTime: boolean = false,
    articleIds: string[] = [],
    includeConflictingDetails: boolean = true
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbKb')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/kb/${kbId}/articles?includeConflictingDetails=${includeConflictingDetails}`
      const body = {
        page,
        sortAscByLastModificationTime,
        size,
        articleIds
      }
      const { data } = await firstValueFrom(
        this.httpService.post<any>(url, body, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // ============ Bot Agents Status (All running bots) ============
  async getAllBotAgentsStatus(
    site_id: string,
    authorization: string,
    organizationid: string,
    environment: string = 'PRODUCTION'
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbMonitoring')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/sysadmin/nodejs/instance/status?environment=${environment}`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // ============ PCS Bots Status ============
  async getPCSBotsStatus(
    site_id: string,
    authorization: string,
    organizationid: string,
    showBotsData: boolean = true
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbMonitoring')
      if (!domain) {
        throw new InternalServerErrorException(`Domain not found for account ${site_id}`)
      }

      const url = `https://${domain}/sysadmin/nodejs/instance/pcs/status?showBotsData=${showBotsData}`
      const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getCBHeaders(authorization, organizationid)
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw error;
          }),
        ),
      )
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
