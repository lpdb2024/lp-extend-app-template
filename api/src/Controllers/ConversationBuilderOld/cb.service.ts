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

}
