import { Controller } from '@nestjs/common';
import { LLMTaskService } from './llm-task.service'
import { API_ROUTES } from '../../constants/constants';

@Controller(API_ROUTES.LLM_TASK())
export class LLMTaskController {
  constructor(private service: LLMTaskService) {}
  
}
