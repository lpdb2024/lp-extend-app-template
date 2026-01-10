import { Transform, TransformFnParams } from 'class-transformer';
import {
  ConversationSurvey,
  CustomerInfoSde,
  MessageData,
  MessageDataRich,
  MessageRecord,
  MessageScore,
  SDEs,
} from 'src/Controllers/LivePerson/ConversationalCloud/conversation-cloud.interfaces';
import { time } from 'console';
import { decrypt, encrypt } from 'src/utils/encryption';
import * as crypto from 'crypto';
const OAuth = require('oauth-1.0a');
import { returnTZ } from './timezones';
import { MESSAGE_TYPES } from 'src/constants/constants';
import * as moment from 'moment';

interface ApiKeyBasic {
  keyId: string;
  appSecret: string;
  token: string;
  tokenSecret: string;
}

export class HelperService {
  ctx = (
    controller: string,
    functionName: string,
    msg: string | object,
    accountId?: string,
  ) => {
    const c = controller.replace(/\[/, '').replace(/\]/, '');
    const f = functionName.replace(/\[/, '').replace(/\]/, '');
    const _ac = accountId ? `[${accountId}]` : '';
    return [`${_ac}[${c}][${f}]:`, msg];
  };

  insertBearer(token: string) {
    const a = token.replace('Bearer', '').trim();
    return `Bearer ${a}`;
  }

  insertCCBearer(token: string) {
    const t = token.includes(' ') ? token.split(' ')[1] : token;
    const aisToken = `CC-Bearer ${t}`;
    return aisToken;
  }

  createConversationalContext(zone: string) {
    const ipAddress = () => {
      const ipAddress = crypto.randomBytes(4).toString('hex');
      return `${ipAddress}.${ipAddress}.${ipAddress}.${ipAddress}`;
    };
    const deviceFamily = ['DESKTOP', 'TABLET', 'MOBILE', 'OTHER'];
    const os = ['WINDOWS', 'ANDROID', 'IOS', 'OSX', 'OTHER'];
    const osNames /* pc os */ = [
      'Windows XP',
      'Windows 7',
      'Windows 8',
      'Windows 10',
      'Windows 11',
      'macOS Mojave',
      'macOS Catalina',
      'macOS Big Sur',
      'macOS Monterey',
      'Linux Ubuntu',
      'Linux Fedora',
      'Linux Mint',
    ];
    const browsers = ['CHROME', 'FIREFOX', 'SAFARI', 'EDGE', 'OPERA', 'OTHER'];
    const integration = ['WEB_SDK', 'MOBILE_SDK', 'BRAND_SDK'];
    const randomDeviceFamily = () => {
      const randomIndex = Math.floor(Math.random() * deviceFamily.length);
      return deviceFamily[randomIndex];
    };
    const randomOs = () => {
      const randomIndex = Math.floor(Math.random() * os.length);
      return os[randomIndex];
    };
    const randomIntegration = () => {
      const randomIndex = Math.floor(Math.random() * integration.length);
      return integration[randomIndex];
    };
    const randomAppId = () => {
      const appId = crypto.randomBytes(4).toString('hex');
      return `webAsync-${appId}`;
    };
    const randomAppVersion = () => {
      const appVersion = crypto.randomBytes(4).toString('hex');
      return `1.0.${appVersion}`;
    };
    const randomOsVersion = () => {
      const osVersion = crypto.randomBytes(4).toString('hex');
      return `10.0.${osVersion}`;
    };
    const randomBrowser = () => {
      const browser = crypto.randomBytes(4).toString('hex');
      return `chrome-${browser}`;
    };
    const randomBrowserVersion = () => {
      const browserVersion = crypto.randomBytes(4).toString('hex');
      return `127.0.0.${browserVersion}`;
    };
    const manufacturorsPhone = [
      'Google',
      'Samsung',
      'Apple',
      'Nokia',
      'Motorola',
      'Sony',
    ];
    const manufacturorsPC = [
      'Dell',
      'HP',
      'Lenovo',
      'Acer',
      'Asus',
      'Microsoft',
      'Toshiba',
      'LG',
      'Razer',
    ];
    const randomPhoneManufacturor = () => {
      const randomIndex = Math.floor(Math.random() * manufacturorsPhone.length);
      return manufacturorsPhone[randomIndex];
    };
    const randomPCManufacturor = () => {
      const randomIndex = Math.floor(Math.random() * manufacturorsPC.length);
      return manufacturorsPC[randomIndex];
    };
    const randomDevice = () => {
      const randomIndex = Math.floor(Math.random() * 2);
      if (randomIndex === 0) {
        return randomPhoneManufacturor();
      } else {
        return randomPCManufacturor();
      }
    };
    const randomDeviceModel = () => {
      const randomIndex = Math.floor(Math.random() * 2);
      if (randomIndex === 0) {
        return crypto.randomBytes(4).toString('hex');
      } else {
        return crypto.randomBytes(4).toString('hex');
      }
    };
    const payload = {
      timeZone: returnTZ(zone),
      type: '.ams.headers.ClientProperties',
      appId: randomAppId(),
      appVersion: randomAppVersion(),
      ipAddress: ipAddress(),
      deviceFamily: randomDeviceFamily(),
      os: randomOs(),
      osVersion: randomOsVersion(),
      browser: randomBrowser(),
      browserVersion: randomBrowserVersion(),
      features: [
        'CO_BROWSE',
        'CO_APP',
        'PHOTO_SHARING',
        'SECURE_FORMS',
        'AUTO_MESSAGES',
        'RICH_CONTENT',
      ],
    };
    return payload;
  }

  richToPlain(event: any) {
    const response = {
      isPlain: false,
      message: event.message,
    };
    try {
      const { quickReplies, message } = event;
      let optionText = '\nselect from the following options:\n';
      const options = [];
      const replies = quickReplies?.replies;
      if (replies?.length) {
        replies.forEach((reply: any) => {
          const action = reply.click?.actions.find(
            (action: any) => action.type === 'publishText',
          );
          if (action) {
            options.push(action.text);
          }
        });
      }

      response.isPlain = replies?.length === 0;
      response.message = `${message} + ${options.length ? optionText + options.map((option: any) => `- ${option}`).join('\n') : ''}`;
      return response;
    } catch (error) {
      console.error('Error in richToPlain: ', error);
      return response;
    }
  }

  // the replaceVars function taks in an array of variables and replaces all instances of the variable in the string with the value
  // placeholder variables in the text are denoted by the format {{variableName}}
  // for example, a request would be [{name: 'var01', value: 'Mike'}], and text would be 'Hello, my name is {{var01}}'

  replaceVars(text: string, vars: { name: string; value: string }[]) {
    vars.forEach((variable) => {
      text = text.replace(
        new RegExp(`{{${variable.name}}}`, 'g'),
        variable.value,
      );
    });
    return text;
  }

  fixJson(str: string) {
    try {
      return JSON.parse(str);
    } catch (e) {
      try {
        return JSON.parse(
          str.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": '),
        );
      } catch (e) {
        return str;
      }
    }
  }

  testJSON = (a: string) => {
    try {
      return JSON.parse(a);
    } catch (error) {}
  };

  extractJson = (str: string) => {
    if (!str) {
      return null;
    }
    const firstOpen = str.indexOf('{');
    const firstClose = str.lastIndexOf('}');
    if (firstClose <= firstOpen) {
      return null;
    }
    const candidate = str.substring(firstOpen, firstClose + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {
      return null;
    }
  };

  findJSON = (msg: string): any => {
    // first, simply test to see if it is a stringified JSON
    try {
      const test = this.testJSON(msg);
      if (test) {
        return test;
      }
      const jr = [msg.indexOf('{') - 1, msg.lastIndexOf('}') + 1];
      if (jr[0] >= 0 && jr[0] >= 0) {
        const objTest = msg.substring(jr[0], jr[1]);
        const test = this.testJSON(objTest);
        if (test) return test;
      }
      const jr1 = [msg.indexOf('{'), msg.lastIndexOf('}') + 1];
      if (jr1[0] >= 0 && jr1[0] >= 0) {
        const objTest = msg.substring(jr1[0], jr1[1]);
        const test = this.testJSON(objTest);
        if (test) return test;
      }
      const eJson = this.extractJson(msg);
      if (eJson) return eJson;
      return null;
    } catch (error) {
      return null;
    }
  };

  hash256(str: string) {
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  getTodayDate() {
    return new Date().toLocaleDateString();
  }

  oAuth1Header = (body: ApiKeyBasic, request: any) => {
    const oauth = new OAuth({
      consumer: {
        key: body.keyId,
        secret: body.appSecret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string: any, key: any) {
        return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64');
      },
    });
    const authorization = oauth.authorize(request, {
      key: body.token,
      secret: body.tokenSecret,
    });

    return oauth.toHeader(authorization);
  };

  queryToString(query: any): string {
    return Object.keys(query)
      .map((key) => `${key}=${query[key]}`)
      .join('&');
  }

  async encrypt(text: string): Promise<string> {
    try {
      const encrypted = await encrypt(text);
      return encrypted;
    } catch (error) {
      console.error('Error encrypting text:', error);
      throw new Error('Encryption failed');
    }
  }

  async decrypt(encryptedText: string): Promise<any> {
    try {
      const decrypted = await decrypt(encryptedText);
      return decrypted;
    } catch (error) {
      console.error('Error decrypting text:', error);
      throw new Error('Decryption failed');
    }
  }

  ToBoolean(): (target: any, key: string) => void {
    return Transform((params: TransformFnParams) => {
      const { value } = params;
      if (typeof value === 'boolean') {
        return value;
      }
      if (value?.toString()?.toLowerCase() === 'false') {
        return false;
      }
      if (value?.toString()?.toLowerCase() === 'true') {
        return true;
      }
      return undefined;
    });
  }

  getFileExt(str: string) {
    try {
      const ext = str.split('.').pop();
      return ext || null;
    } catch (error) {
      return null;
    }
  }

  static toCamelCase(str: string): string {
    return str.replace(/([-_][a-z])/gi, ($1) => {
      return $1.toUpperCase().replace('-', '').replace('_', '');
    });
  }

  static toSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, ($1) => {
      return `_${$1.toLowerCase()}`;
    });
  }

  static toCamelCaseObject(obj: any): any {
    if (typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((v) => HelperService.toCamelCaseObject(v));
    }
    const newObj: any = {};
    Object.keys(obj).forEach((key) => {
      newObj[HelperService.toCamelCase(key)] = HelperService.toCamelCaseObject(
        obj[key],
      );
    });
    return newObj;
  }

  static toSnakeCaseObject(obj: any): any {
    if (typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((v) => HelperService.toSnakeCaseObject(v));
    }
    const newObj: any = {};
    Object.keys(obj).forEach((key) => {
      newObj[HelperService.toSnakeCase(key)] = HelperService.toSnakeCaseObject(
        obj[key],
      );
    });
    return newObj;
  }

  yesNoToBoolean(value: string | boolean): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (value === null || value === undefined) {
      return false;
    }
    const affirmativePatterns = [
      'yes',
      'true',
      '1',
      'y',
      'ok',
      'affirmative',
      'sure',
      'absolutely',
      'definitely',
      'certainly',
      'i guess',
      'i think so',
      'i suppose so',
      'i believe so',
      'i reckon',
      'i would say so',
      'i would think so',
      'i would guess so',
      'i would suppose so',
      'i would believe so',
      'i would reckon',
    ];
    const negativePatterns = [
      'no',
      'false',
      '0',
      'n',
      'nah',
      'negative',
      'nope',
      'not really',
      'not at all',
      "i don't think so",
      "i don't believe so",
      "i don't reckon",
      "i wouldn't say so",
      "i wouldn't think so",
      "i wouldn't guess so",
      "i wouldn't suppose so",
      "i wouldn't believe so",
      "i wouldn't reckon",
      'absolutely not',
      'definitely not',
      'certainly not',
      'not in a million years',
      'not even close',
      'not even remotely',
      'not even slightly',
      'not even a little bit',
      'not even a tiny bit',
      'not even a smidgen',
      'not even a fraction',
    ];
    const affirmativeRegex = new RegExp(
      `^(${affirmativePatterns.join('|')})$`,
      'i',
    );
    const negativeRegex = new RegExp(`^(${negativePatterns.join('|')})$`, 'i');
    const isNegative = negativeRegex.test(value);
    const isAffirmative = affirmativeRegex.test(value);
    if (isNegative) {
      return false;
    }
    if (isAffirmative) {
      return true;
    }
    // If the value is not a clear yes or no, return undefined
    // or handle it as per your requirement
    return false;
  }

  transcriptToRaw(messageRecords: MessageRecord[]): string {
    let transcript = '';
    for (const record of messageRecords) {
      if (record.type === MESSAGE_TYPES.TEXT_PLAIN) {
        transcript += `${record.sentBy}:\n
        ${(record.messageData as MessageData).msg.text}\n
        ${record.time}\n\n`;
      } else {
        const data = (record.messageData as MessageDataRich).richContent
          .content;
        if (data) {
          transcript += `${record.sentBy}:\n
          ${data}\n
          ${record.time}\n\n`;
        }
      }
    }
    return transcript;
  }

  isNotNullOrUndefined(value: any): boolean {
    return value !== null && value !== undefined;
  }

  getPersonalInfoSde(sdes: SDEs) {
    const personalInfoSde = sdes?.events?.find(
      (sde) => sde.sdeType === 'PERSONAL_INFO',
    );
    if (personalInfoSde) {
      return personalInfoSde.personalInfo?.personalInfo;
    }
    return null;
  }

  getCustomerInfoSdes(sdes: SDEs) {
    const SDE = sdes?.events?.find((sde) => sde.sdeType === 'CUSTOMER_INFO');
    const customerInfoSde: CustomerInfoSde = SDE?.customerInfo;
    if (customerInfoSde?.customerInfo) {
      return {
        customerStatus: customerInfoSde.customerInfo.customerStatus,
        customerType: customerInfoSde.customerInfo.customerType,
      };
    }
    return null;
  }

  removeObjectProperties(obj: any, properties: string[]): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj; // Return the original value if it's not an object
    }
    const newObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && !properties.includes(key)) {
        newObj[key] = obj[key]; // Copy properties that are not in the properties array
      }
    }
    return newObj;
  }
}

export const helper = new HelperService();
