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
    // const apiKey = process.env.OPENAI_API_KEY
    // const organisation = process.env.OPENAI_ORGANISATION
    
    // this.openai = new OpenAI({
    //   apiKey: apiKey,
    //   organization: organisation,
    // });
  }
  

}
