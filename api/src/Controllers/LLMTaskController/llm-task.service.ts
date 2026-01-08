import {
  Injectable,
  Inject,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import OpenAI from 'openai';
import OpenAIApi from 'openai';
import { CollectionReference } from '@google-cloud/firestore';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { helper } from 'src/utils/HelperService';
import { uuid } from 'short-uuid';
import { IUser } from 'src/interfaces/interfaces'
import { defaultPrompts } from './llm-task.constants'
import {
  ConversationTopicDto,
  ConversationTopicRequestDto,
  ConversationSampleDto
} from './llm-task.dto'

@Injectable()
export class LLMTaskService {  
  private logger: Logger = new Logger(LLMTaskService.name);
  public openai: OpenAIApi;

  constructor(
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORGANISATION,
    });
  }

  async generateConversations(body: any): Promise<any> | null {
    const {
      max_conversation,
      verticalName,
      name, // topic name
      description
    } = body
    const prompt = helper.replaceVars(defaultPrompts.CREATE_MOCK_CONVERSATIONS,
      [{
        name: 'max_conversation',
        value: max_conversation
      }]
    )
    let systemMessage = `
    BRIEF:: today's date is ${helper.getTodayDate()}\n
    the intent or topic for these conversations is: ${name}\n
    intent/topic description: ${description}\n
    `
    systemMessage += "[TASK]::\n"
    systemMessage += prompt
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2500,
      messages: [
        {
          role: 'system',
          content: systemMessage
        }
      ]
    })
    const outcome = helper.fixJson(response.choices[0].message.content)
    return outcome

  }

  async predictDefaultBranding (body: string, brandName: string): Promise<any> | null {
    console.info("body", body)
    
    let systemMessage = `
    interface ResultsSchema  {
      brandname: string;
      url: string; 
      brandLogo: string | null; // ${brandName} brand logo
      brandLogoWhite: string | null; // ${brandName} brand in white with transparent background
      brandIcon: string | null; // small ${brandName} brand icon with transparent background.
      brandIconWhite: string | null; // white ${brandName} icon with transparent background      
      brandColors: string[] // ${brandName} brand colours of the brand - this show only be 2 to 3 colours max, the theme / and represents the branding of the company
    }

    instructions: our task is to get the branding and imagery for a particular brand.
    analyse the below WEB_SCRAPE from the ${brandName} website, and based on the information provided PLUS what you know about the company, provide the result for the ResultsSchema. 
    Try your best to analyse the data provided, and populate the assets with the most relevant information.
    for example, if the brand name is 'CBA', then the 'brandLogo' field should be the logo of CBA, and the 'brandColors' field should be the main colours of CBA.
    For ICONS, look for the smaller images in the array of images, and use the most relevant one.

    your response should match the interface provided above.
    we are looking for actual color RGBS/HEX values, and image srcs for the relevent image fields.

    WEB_SCRAPE::\n
    ${body}

    `
    systemMessage += "[TASK]::\n"
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 3500,
      messages: [
        {
          role: 'system',
          content: systemMessage
        }
      ]
    })
    console.log("response", response.choices[0].message.content)
    const outcome = helper.findJSON(response.choices[0].message.content)
    return outcome

  }
  

}
