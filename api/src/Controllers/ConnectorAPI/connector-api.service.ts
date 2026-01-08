import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import {
  Injectable,
  Inject,
  InternalServerErrorException,
  forwardRef,
  OnModuleInit
} from '@nestjs/common';
import { CollectionReference } from '@google-cloud/firestore';
import { HttpService } from '@nestjs/axios';
import {
  catchError,
  firstValueFrom
} from 'rxjs';
import { AxiosError } from 'axios';
import { HelperService } from '../HelperService/helper-service.service';
import { uuid } from 'short-uuid';
import { ExChangeEvent } from 'src/interfaces/interfaces'
import {
  accountCache,
  getAllCaches
} from 'src/utils/memCache';
import {  jwtDecode } from "jwt-decode";
import { randomName } from 'src/utils/consumer_names';
import { APIService } from '../APIService/api-service';
import { ConfigService } from '@nestjs/config';
import { helper } from 'src/utils/HelperService';
const { ctx } = helper
const context = 'ConnectorAPIService'
export const CRON_NAME = 'scheduledResponder'

const loggingMode = Boolean(process.env.LOGGING_ENABLED || false)
@Injectable()
export class ConnectorAPIService {
  constructor(
    @InjectPinoLogger(ConnectorAPIService.name)
    private readonly logger: PinoLogger,
    private readonly httpService: HttpService,
    private readonly helperService: HelperService,
    private readonly apiService: APIService,
    private configService: ConfigService = new ConfigService()
  ) {
    this.logger.setContext('ConnectorAPIService');
  }

  async getAppJwt(accountId: string): Promise<string | null> {
    try {
      const key = `CR_${accountId}_connector_app_jwt`
      const cachedAppJwt = accountCache(accountId).get(key)
      if (cachedAppJwt) {
        return cachedAppJwt
      }
      const domain = await this.helperService.getDomain(accountId, 'sentinel')
      if (!domain) {
        this.logger.error({
          fn: 'getAppJwt',
          level: 'error',
          message: 'Domain not found for service: sentinel',
          accountId
        })
        return null
      }

      const clientId = this.configService.get<string>('CONNECTOR_API_BASIC_CLIENT_ID')
      const clientSecret = this.configService.get<string>('CONNECTOR_API_BASIC_CLIENT_SECRET')
      const url = `https://${domain}/sentinel/api/account/${accountId}/app/token?v=1.0&grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded"
      }
      const response = await firstValueFrom(
        this.httpService.post<string>(url, {}, { headers }).pipe(
          catchError((error: AxiosError) => {
            throw {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data
            }
          }),
        ),
      )
      const appJwt: any = response.data
      const accessToken = appJwt.access_token
      accountCache(accountId).add(key, accessToken, appJwt.expires_in)
      return accessToken
    } catch (error) {
      throw new InternalServerErrorException(`Error getting app jwt for account ${accountId}`, error);
    }
  }

  async publishConsumerMessage(
    siteId: string,
    appJwt: string,
    consumerJws: string,
    message: string,
    conversationId: string,
    dialogId?: string
  ): Promise<any> | null {
    try {
      if (!message) {
        this.logger.error({
          fn: 'publishConsumerMessage',
          level: 'error',
          message: 'Message is required',
          siteId,
          conversationId
        })
        throw new InternalServerErrorException(`Message is required`)
      }
      if (!conversationId) {
        this.logger.error({
          fn: 'publishConsumerMessage',
          level: 'error',
          message: 'Conversation id is required',
          siteId,
          conversationId
        })
        throw new InternalServerErrorException(`Conversation id is required`)
      }
      const request_body: any = {
        "kind":"req",
        "id":"1",
        "type":"ms.PublishEvent",
        "body":{
          conversationId,
          dialogId: dialogId || conversationId,
            "event":{
              "type":"ContentEvent",
              "contentType":"text/plain",
              "message": message
            }
        }
      }
      const domain = await this.helperService.getDomain(siteId, 'asyncMessagingEnt')
      const url = `https://${domain}/api/account/${siteId}/messaging/consumer/conversation/send?v=3`
      const headers = {
        'Content-Type': 'application/json',
        "Authorization": appJwt,
        "X-LP-ON-BEHALF": consumerJws
      }
      const { data } = await firstValueFrom(
        this.httpService.post(url, request_body, { headers }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error({
              fn: 'publishConsumerMessage',
              level: 'error',
              message: 'Error publishing consumer message',
              siteId,
              conversationId,
              error: error.response.data
            })
            throw {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
              request_body
            }
          }),
        ),
      )
      return data
    } catch (error) {
      this.logger.error({
        fn: 'publishConsumerMessage',
        level: 'error',
        message: 'Error publishing consumer message',
        siteId,
        error
      })
    }
  }

  async publishAgentMessage (
    siteId: string,
    message: string,
    conversationId: string,
    dialogId?: string
  ): Promise<any> | null {
    const fn = 'publishAgentMessage'
    try {
      const appJwt = await this.getAppJwt(siteId)
      if (!message) {
        this.logger.error({
          fn,
          level: 'error',
          message: 'Message is required',
          accountId: siteId,
          conversationId
        })
        throw new InternalServerErrorException(`Message is required`)
      }
      if (!conversationId) {
        this.logger.error({
          fn,
          level: 'error',
          message: 'Conversation id is required',
          accountId: siteId,
          conversationId
        })
        throw new InternalServerErrorException(`Conversation id is required`)
      }

      const request_body: any = {
        kind:'req',
        id: uuid(),
        type:'.ams.ms.PublishEvent',
        headers: {
          type: '.ams.headers.BrandUserAuthentication',
          userPublicId: 'ed47c71c-40ab-5243-a76b-e29facbfe94e'
        },
        body:{
          conversationId,
          dialogId: dialogId || conversationId,
          eventId: 'cc29ac8b-59c2-4603-af5e-d724213c81b6_msggw_behalf_of_agent',
          event:{
            type: 'ContentEvent',
            contentType: 'text/plain',
            message: 'test message'
          }
        },
        metadata: []
      }

      const domain = await this.helperService.getDomain(siteId, 'asyncMessagingEnt')
      const url = `https://${domain}/api/account/${siteId}/messaging/consumer/conversation/send?v=3`
      const headers = {
        'Content-Type': 'application/json',
        "Authorization": appJwt
      }
      const { data } = await firstValueFrom(
        this.httpService.post(url, request_body, { headers }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error({
              fn,
              level: 'error',
              message: 'Error publishing agent message',
              accountId: siteId,
              conversationId,
              error: error.response.data
            })
            throw {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data
            }
          }),
        ),
      )
      return data
    } catch (error) {
      this.logger.error({
        fn,
        level: 'error',
        message: 'Error publishing agent message',
        accountId: siteId,
        error
      })
      throw new InternalServerErrorException(error)
    }
  }

  async getConsumerJWS(accountId: string, appJwt: string, consumerId?: string): Promise<any | null> {
    try {
      const key = `token_${consumerId}`
      const cachedConsumerJwt = accountCache(accountId).get(key)
      if (cachedConsumerJwt) {
        return cachedConsumerJwt
      }
      const domain = await this.helperService.getDomain(accountId, 'idp')
      if (!domain) {
        this.logger.error({
          fn: 'getConsumerJWS',
          level: 'error',
          message: 'Domain not found for service: idp',
          accountId: accountId
        })
        return null
      }
      const extConsumerId = consumerId || uuid()
      const url = `https://${domain}/api/account/${accountId}/consumer?v=1.0`
      const headers = {
        "Content-Type": "application/json",
        "Authorization": appJwt
      }
      const body = {
        "ext_consumer_id": extConsumerId
      }
      const { data } = await firstValueFrom(
        this.httpService.post<{ token: string; }>(url, body, { headers }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error({
              fn: 'getConsumerJWS',
              level: 'error',
              message: 'Error getting consumer jws',
              accountId,
              error: error.response.data
            })
            throw {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data
            }
          }),
        ),
      )

      const { token } = data

      accountCache(accountId).add(`token_${extConsumerId}`, token, 3600)

      const decodedJwt: any = jwtDecode(token)
      const lpConsumerId = decodedJwt.lp_consumer_id
      accountCache(accountId).add(`lp_consumer_id_${extConsumerId}`, lpConsumerId, 3600)
      const returnObject = {
        consumer_token: token,
        lp_consumer_id: lpConsumerId,
        ext_consumer_id: extConsumerId
      }
      return returnObject
    } catch (error) {
      this.logger.error({
        fn: 'getConsumerJWS',
        level: 'error',
        message: 'Error getting consumer jws',
        accountId,
        error
      })
      throw new InternalServerErrorException(error)
    }
  }

  async sendCreateConversationRequest(
    siteId: string,
    appJwt: string,
    consumerToken: string,
    skillId: number,
    useFakeNames: boolean,
    scenario: string,
    persona: string
  ): Promise<{conversationId: string; consumerName: string; }> | null {
    try {

      const consumerName = randomName()
      const firstName = consumerName.split(" ")[0]
      const lastName = consumerName.split(" ")[1]
      const req1 = {
        "kind": "req",
        "id": "1",
        "type": "userprofile.SetUserProfile",
        "body": {
          "authenticatedData": {
            "lp_sdes": []
          }
        }
      }
      if (useFakeNames) {
        req1.body.authenticatedData.lp_sdes.push({
          "type": "personal",
          "personal": {
            "firstname": firstName,
            "lastname": lastName,
            "language": "en-US"
          }
        })
        req1.body.authenticatedData.lp_sdes.push({
          "type": "ctmrinfo",
          "info": {
            "cstatus": scenario || '',
            "ctype": persona || '',
          }
        })
      }
      const request_body = [
        req1,
        {
          kind: 'req',
          id: '2',
          type: 'cm.ConsumerRequestConversation',
          body: {
            ttrDefName:'NORMAL',
            channelType:'MESSAGING',
            brandId: siteId,
            skillId,
            conversationContext: {
              interactionContextId: uuid(),
              type: 'SharkContext',
              lang: 'en-US',
              clientProperties: {
                type: '.ClientProperties',
                appId: 'webAsync',
                ipAddress: '172.22.137.212',
                deviceFamily: 'DESKTOP',
                os: 'OSX',
                osVersion: '10.15.7',
                integration: 'BRAND_SDK',
                integrationVersion: '3.10.0',
                browser: 'CHROME',
                browserVersion: '127.0.0.0',
                timeZone: 'Sydney/Australia',
                features: [
                  'PHOTO_SHARING',
                  'CO_BROWSE',
                  'QUICK_REPLIES',
                  'MARKDOWN_HYPERLINKS',
                  'AUTO_MESSAGES',
                  'MULTI_DIALOG',
                  'FILE_SHARING',
                  'RICH_CONTENT'
                ]
              },
            },
          }
        }

      ]

      const domain = await this.helperService.getDomain(siteId, 'asyncMessagingEnt')
      if (!domain) {
        this.logger.error({
          fn: 'sendCreateConversationRequest',
          level: 'error',
          message: 'Domain not found for service: asyncMessagingEnt',
          siteId
        })
        return null
      }
      const url = `https://${domain}/api/account/${siteId}/messaging/consumer/conversation?v=3`
      const headers = {
        'Content-Type': 'application/json',
        "Authorization": appJwt,
        "X-LP-ON-BEHALF": consumerToken
      }
      const { data } = await this.apiService.post<any[]>(url, request_body, { headers })
      const conversation_body = data?.find((item: any) => item.reqId === "2")
      const conversationId = conversation_body?.body?.conversationId
      return {
        conversationId,
        consumerName
      }
    } catch (error) {
      this.logger.error({
        fn: 'sendCreateConversationRequest',
        level: 'error',
        message: 'Error sending create conversation request',
        siteId,
        error
      })
      throw new InternalServerErrorException(error)
    }
  }

  async closeConversation(
    siteId: string,
    consumerJws: string,
    conversationId: string,
    dialog?: boolean
  ): Promise<any> | null {
    const fn = 'closeConversation'
    try {
      if (!conversationId) {
        throw new InternalServerErrorException(`Conversation id is required`)
      }

      const appJwt = await this.getAppJwt(siteId)
      if (!appJwt) {
        throw new InternalServerErrorException(`AppJwt is required`)
      }
      if (!consumerJws) {
        throw new InternalServerErrorException(`Consumer JWS is required`)
      }
      if (!siteId) {
        throw new InternalServerErrorException(`Site id is required`)
      }
      const request_body = !dialog ? {
        kind:"req",
        id:1,
        body: {
            conversationId,
            conversationField:{
              field:"ConversationStateField",
              conversationState:"CLOSE"
            }
        },
        type:"cm.UpdateConversationField"
      } : {
        kind:"req",
        id:1,
        body: {
            conversationId,
            conversationField: {
              field: 'DialogChange',
              type: 'UPDATE',
              dialog: { dialogId: conversationId, state: 'CLOSE', closedCause: 'Closed by consumer' }
            }
        },
        type:"cm.UpdateConversationField"
      }
      const domain = await this.helperService.getDomain(siteId, 'asyncMessagingEnt')
      if (!domain) {
        this.logger.error({
          fn,
          level: 'error',
          message: 'Domain not found for service: asyncMessagingEnt',
          siteId
        })
        return null
      }
      const url = `https://${domain}/api/account/${siteId}/messaging/consumer/conversation/send?v=3`
      const headers = {
        'Content-Type': 'application/json',
        "Authorization": appJwt,
        "X-LP-ON-BEHALF": consumerJws
      }
      const { data } = await firstValueFrom(
        this.httpService.post(url, request_body, { headers }).pipe(
          catchError((error: AxiosError) => {
            const e = ctx(context, fn, String(error.response.data), siteId)
            throw new InternalServerErrorException(error);
          }),
        ),
      )
      this.logger.info({
        fn,
        level: 'info',
        message: 'Conversation closed successfully',
        siteId,
        conversationId,
        data
      })

      return data
    } catch (error) {
      this.logger.error({
        fn,
        level: 'error',
        message: 'Error closing conversation',
        siteId,
        conversationId,
        error
      })
    }
  }

  async contentEvent(accountId: string, data: any) {}

  async exChangeEvent(accountId: string, data: ExChangeEvent) {}


}
