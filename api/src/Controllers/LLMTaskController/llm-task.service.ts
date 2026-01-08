import {
  Injectable,
} from '@nestjs/common';
import OpenAIApi from 'openai';

@Injectable()
export class LLMTaskService {  
  // private logger: Logger = new Logger(LLMTaskService.name);
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
