import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsIn, IsInt, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { HelperService } from 'src/utils/HelperService';

const JS = new HelperService();
const { ToBoolean } = JS;

// ==================== AI Studio Core DTOs ====================

/**
 * Query type for conversation retrieval
 */
export enum ConversationQueryType {
  OFFSET = 'offset',
  ID = 'id',
  PAGE = 'page'
}

/**
 * Direction for sorting
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Simulation types
 */
export enum SimulationType {
  QA = 'qa',
  CONVERSATION = 'conversation'
}

/**
 * Simulation job status
 */
export enum SimulationStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Flow node types
 */
export enum FlowNodeType {
  LPLLMGateway = 'LPLLMGateway',
  LPContextualMemory = 'LPContextualMemory',
  LLMChain = 'LLMChain',
  LPPrompt = 'LPPrompt',
  KnowledgeBase = 'KnowledgeBase',
  Router = 'Router'
}

// ==================== Category DTOs ====================

export class CategoryCreateDto {
  @ApiProperty({ description: 'Display name of the category' })
  @IsString()
  display_name: string;

  @ApiPropertyOptional({ description: 'Description of the category' })
  @IsOptional()
  @IsString()
  display_description?: string;
}

export class CategoryUpdateDto extends CategoryCreateDto {}

export class CategoryResponseDto extends CategoryCreateDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  created_by?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  created_at?: number;
}

// ==================== Conversation DTOs ====================

export class ConversationMessageDto {
  @ApiProperty({ description: 'Speaker identifier (consumer, bot, agent)' })
  @IsString()
  speaker: string;

  @ApiProperty({ description: 'Message text content' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ description: 'Timestamp of the message' })
  @IsOptional()
  @IsNumber()
  time?: number;

  @ApiPropertyOptional({ description: 'Message ID' })
  @IsOptional()
  @IsString()
  id?: string;
}

export class ConversationCreateDto {
  @ApiPropertyOptional({ description: 'Initial messages for the conversation' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessageDto)
  messages?: ConversationMessageDto[];

  @ApiPropertyOptional({ description: 'Flow ID to use for the conversation' })
  @IsOptional()
  @IsString()
  flow_id?: string;

  @ApiPropertyOptional({ description: 'Whether to save the conversation', default: false })
  @IsOptional()
  @IsBoolean()
  saved?: boolean;

  @ApiPropertyOptional({ description: 'Source of the conversation' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Whether to include greeting', default: false })
  @IsOptional()
  @IsBoolean()
  include_greeting?: boolean;
}

export class ConversationUpdateDto {
  @ApiPropertyOptional({ description: 'Whether the conversation is saved' })
  @IsOptional()
  @IsBoolean()
  saved?: boolean;

  @ApiPropertyOptional({ description: 'Whether the conversation is public' })
  @IsOptional()
  @IsBoolean()
  public?: boolean;

  @ApiPropertyOptional({ description: 'Custom label for the conversation' })
  @IsOptional()
  @IsString()
  custom_label?: string;

  @ApiPropertyOptional({ description: 'Custom name for the conversation' })
  @IsOptional()
  @IsString()
  custom_name?: string;
}

export class ConversationQueryDto {
  @ApiPropertyOptional({ enum: ConversationQueryType })
  @IsOptional()
  @IsEnum(ConversationQueryType)
  query_type?: ConversationQueryType;

  @ApiPropertyOptional({ enum: SortDirection })
  @IsOptional()
  @IsEnum(SortDirection)
  direction?: SortDirection;

  @ApiPropertyOptional({ description: 'Number of results to return (1-250)', default: 10 })
  @IsOptional()
  @IsInt()
  limit?: number;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ description: 'Offset for pagination' })
  @IsOptional()
  @IsInt()
  offset?: number;

  @ApiPropertyOptional({ description: 'Start timestamp' })
  @IsOptional()
  @IsNumber()
  start?: number;

  @ApiPropertyOptional({ description: 'End timestamp' })
  @IsOptional()
  @IsNumber()
  end?: number;

  @ApiPropertyOptional({ description: 'Source filter' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Conversation ID filter' })
  @IsOptional()
  @IsString()
  conversation_id?: string;

  @ApiPropertyOptional({ description: 'Include messages in response' })
  @IsOptional()
  @IsBoolean()
  include_messages?: boolean;

  @ApiPropertyOptional({ description: 'Include suggestions in response' })
  @IsOptional()
  @IsBoolean()
  include_suggestions?: boolean;

  @ApiPropertyOptional({ description: 'Filter by feedback presence' })
  @IsOptional()
  @IsBoolean()
  has_feedback?: boolean;

  @ApiPropertyOptional({ description: 'Filter by suggestions presence' })
  @IsOptional()
  @IsBoolean()
  has_suggestions?: boolean;
}

export class ConversationAttributesUpdateDto {
  @ApiPropertyOptional({ description: 'Current slots' })
  @IsOptional()
  @IsObject()
  current_slots?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Context variables' })
  @IsOptional()
  @IsObject()
  context_vars?: Record<string, any>;
}

// ==================== Summary DTOs ====================

export class SummaryCreateDto {
  @ApiProperty({ description: 'Conversation ID to summarize' })
  @IsString()
  conv_id: string;

  @ApiPropertyOptional({ description: 'Whether to include structured summary' })
  @IsOptional()
  @IsBoolean()
  structured_summary?: boolean;
}

export class SummaryBatchCreateDto {
  @ApiProperty({ description: 'Search criteria' })
  @IsString()
  search_by: string;

  @ApiPropertyOptional({ description: 'Base query' })
  @IsOptional()
  @IsObject()
  base_query?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Aggregator query' })
  @IsOptional()
  @IsObject()
  aggregator_query?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Limit number of results' })
  @IsOptional()
  @IsInt()
  limit?: number;
}

// ==================== Query DTOs ====================

export class QueryGenerateDto {
  @ApiProperty({ description: 'Conversation ID to query' })
  @IsString()
  conv_id: string;

  @ApiProperty({ description: 'Query to run' })
  @IsString()
  query: string;
}

// ==================== Simulation DTOs ====================

export class SimulationQuestionDto {
  @ApiProperty({ description: 'Question text' })
  @IsString()
  question: string;

  @ApiPropertyOptional({ description: 'Expected answer' })
  @IsOptional()
  @IsString()
  expected_answer?: string;
}

export class SimulationJobDto {
  @ApiPropertyOptional({ description: 'Job ID' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ description: 'Flow ID' })
  @IsOptional()
  @IsString()
  flow_id?: string;

  @ApiPropertyOptional({ description: 'Knowledge base IDs' })
  @IsOptional()
  @IsArray()
  knowledgebase_ids?: string[];
}

export class SimulationCreateDto {
  @ApiProperty({ enum: SimulationType, description: 'Type of simulation' })
  @IsEnum(SimulationType)
  type: SimulationType;

  @ApiPropertyOptional({ description: 'Questions for the simulation' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimulationQuestionDto)
  questions?: SimulationQuestionDto[];

  @ApiPropertyOptional({ description: 'Jobs to run in the simulation' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimulationJobDto)
  jobs?: SimulationJobDto[];
}

export class SimulationUpdateDto {
  @ApiPropertyOptional({ description: 'Questions for the simulation' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimulationQuestionDto)
  questions?: SimulationQuestionDto[];

  @ApiPropertyOptional({ description: 'Jobs to run in the simulation' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimulationJobDto)
  jobs?: SimulationJobDto[];

  @ApiPropertyOptional({ description: 'Whether to evaluate similarity' })
  @IsOptional()
  @IsBoolean()
  evaluate_similarity?: boolean;
}

export class SimulationQueryDto {
  @ApiPropertyOptional({ description: 'Offset for pagination' })
  @IsOptional()
  @IsInt()
  offset?: number;

  @ApiPropertyOptional({ description: 'Start after ID' })
  @IsOptional()
  @IsString()
  start_after_id?: string;

  @ApiPropertyOptional({ description: 'End before ID' })
  @IsOptional()
  @IsString()
  end_before_id?: string;

  @ApiPropertyOptional({ description: 'Limit (1-100)', default: 10 })
  @IsOptional()
  @IsInt()
  limit?: number;

  @ApiPropertyOptional({ description: 'Owner filter (self/all)' })
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiPropertyOptional({ enum: SimulationType })
  @IsOptional()
  @IsEnum(SimulationType)
  simulation_type?: SimulationType;
}

// ==================== Transcript Analysis DTOs ====================

export class TranscriptAnalysisQuestionDto {
  @ApiProperty({ description: 'Question text' })
  @IsString()
  question: string;

  @ApiPropertyOptional({ description: 'Question type' })
  @IsOptional()
  @IsString()
  type?: string;
}

export class TranscriptAnalysisCreateDto {
  @ApiProperty({ description: 'Display name' })
  @IsString()
  display_name: string;

  @ApiProperty({ description: 'Source of transcripts' })
  @IsString()
  source: string;

  @ApiPropertyOptional({ description: 'Conversation IDs to analyze' })
  @IsOptional()
  @IsArray()
  conversations?: string[];

  @ApiPropertyOptional({ description: 'Questions to answer' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranscriptAnalysisQuestionDto)
  questions?: TranscriptAnalysisQuestionDto[];
}

export class TranscriptAnalysisUpdateDto {
  @ApiPropertyOptional({ description: 'Display name' })
  @IsOptional()
  @IsString()
  display_name?: string;

  @ApiPropertyOptional({ description: 'Questions to answer' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranscriptAnalysisQuestionDto)
  questions?: TranscriptAnalysisQuestionDto[];

  @ApiPropertyOptional({ description: 'Conversation IDs' })
  @IsOptional()
  @IsArray()
  conversations?: string[];
}

// ==================== Knowledgebase DTOs ====================

export class KnowledgebaseSearchDto {
  @ApiProperty({ description: 'Search text' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ description: 'Number of results to return', default: 5 })
  @IsOptional()
  @IsInt()
  top_k?: number;
}

export class KnowledgebaseTextItemDto {
  @ApiProperty({ description: 'Text content' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ description: 'Item title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Item metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// ==================== Flow DTOs ====================

export class FlowNodeDataDto {
  [key: string]: any;
}

export class FlowNodeDto {
  @ApiProperty({ description: 'Node ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Node type', enum: FlowNodeType })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Node data' })
  @IsOptional()
  @IsObject()
  data?: FlowNodeDataDto;

  @ApiPropertyOptional({ description: 'Node position' })
  @IsOptional()
  @IsObject()
  position?: { x: number; y: number };

  @ApiPropertyOptional({ description: 'Base type' })
  @IsOptional()
  @IsString()
  base_type?: string;

  @ApiPropertyOptional({ description: 'Whether node is disabled' })
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;
}

export class FlowEdgeDto {
  @ApiProperty({ description: 'Edge ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Source node ID' })
  @IsString()
  source: string;

  @ApiProperty({ description: 'Target node ID' })
  @IsString()
  target: string;

  @ApiPropertyOptional({ description: 'Source handle' })
  @IsOptional()
  @IsString()
  sourceHandle?: string;

  @ApiPropertyOptional({ description: 'Target handle' })
  @IsOptional()
  @IsString()
  targetHandle?: string;

  @ApiPropertyOptional({ description: 'Whether edge is disabled' })
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;
}

export class FlowCreateDto {
  @ApiProperty({ description: 'Display name of the flow' })
  @IsString()
  display_name: string;

  @ApiPropertyOptional({ description: 'Flow nodes' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowNodeDto)
  nodes?: FlowNodeDto[];

  @ApiPropertyOptional({ description: 'Flow edges' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowEdgeDto)
  edges?: FlowEdgeDto[];
}

export class FlowUpdateDto extends FlowCreateDto {}

export class FlowQueryDto {
  @ApiPropertyOptional({ description: 'Scroll ID for pagination' })
  @IsOptional()
  @IsString()
  scroll_id?: string;

  @ApiPropertyOptional({ description: 'Number of results per scroll' })
  @IsOptional()
  @IsInt()
  scroll_amount?: number;

  @ApiPropertyOptional({ description: 'Filter by creator (self/any)' })
  @IsOptional()
  @IsString()
  created_by?: string;

  @ApiPropertyOptional({ description: 'Flow type filter' })
  @IsOptional()
  @IsString()
  flow_type?: string;
}

export class FlowInvokeDto {
  @ApiProperty({ description: 'User input text' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ description: 'Previous messages' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessageDto)
  messages?: ConversationMessageDto[];

  @ApiPropertyOptional({ description: 'Flow object (if not using flow_id)' })
  @IsOptional()
  @IsObject()
  flow?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Source identifier' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Whether to save the answer' })
  @IsOptional()
  @IsBoolean()
  save_answer?: boolean;

  @ApiPropertyOptional({ description: 'Whether to save the conversation' })
  @IsOptional()
  @IsBoolean()
  save_conv?: boolean;

  @ApiPropertyOptional({ description: 'Bot context variables' })
  @IsOptional()
  @IsObject()
  bot_context_vars?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Enable debug mode' })
  @IsOptional()
  @IsBoolean()
  debug?: boolean;
}

// ==================== Evaluator DTOs ====================

export class SimilarityEvaluationDto {
  @ApiProperty({ description: 'Actual answer from the system' })
  @IsString()
  actual_answer: string;

  @ApiProperty({ description: 'Expected/reference answer' })
  @IsString()
  expected_answer: string;

  @ApiPropertyOptional({ description: 'Original question' })
  @IsOptional()
  @IsString()
  question?: string;
}

export class ResolutionEvaluationDto {
  @ApiProperty({ description: 'Conversation ID to evaluate' })
  @IsString()
  conv_id: string;
}

export class GuidedRoutingEvaluationDto {
  @ApiProperty({ description: 'Intent to evaluate' })
  @IsString()
  intent: string;

  @ApiPropertyOptional({ description: 'Flow ID' })
  @IsOptional()
  @IsString()
  flow_id?: string;

  @ApiPropertyOptional({ description: 'Flow object' })
  @IsOptional()
  @IsObject()
  flow?: Record<string, any>;
}

// ==================== Generator DTOs ====================

export class QuestionGeneratorDto {
  @ApiPropertyOptional({ description: 'Search criteria for conversations' })
  @IsOptional()
  @IsObject()
  search_criteria?: Record<string, any>;
}

export class KAIRouteGeneratorDto {
  @ApiProperty({ description: 'Flow ID' })
  @IsString()
  flow_id: string;

  @ApiPropertyOptional({ description: 'Knowledge base IDs' })
  @IsOptional()
  @IsArray()
  knowledgebase_ids?: string[];
}

// ==================== Prompt Library DTOs ====================

export class PromptConfigurationDto {
  @ApiPropertyOptional({ description: 'LLM provider' })
  @IsOptional()
  @IsString()
  llm_provider?: string;

  @ApiPropertyOptional({ description: 'Model name' })
  @IsOptional()
  @IsString()
  model_name?: string;

  @ApiPropertyOptional({ description: 'Temperature setting' })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ description: 'Max tokens' })
  @IsOptional()
  @IsInt()
  max_tokens?: number;
}

export class PromptLibraryCreateDto {
  @ApiProperty({ description: 'Prompt name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Client type' })
  @IsOptional()
  @IsString()
  clientType?: string;

  @ApiPropertyOptional({ description: 'Language code' })
  @IsOptional()
  @IsString()
  langCode?: string;

  @ApiProperty({ description: 'Prompt header/template' })
  @IsString()
  promptHeader: string;

  @ApiPropertyOptional({ description: 'Prompt configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PromptConfigurationDto)
  configuration?: PromptConfigurationDto;
}

export class PromptLibraryUpdateDto extends PromptLibraryCreateDto {}

// ==================== User DTOs ====================

export class AIStudioUserCreateDto {
  @ApiProperty({ description: 'User email' })
  @IsString()
  email: string;

  @ApiPropertyOptional({ description: 'User password' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: 'Display name' })
  @IsOptional()
  @IsString()
  display_name?: string;

  @ApiPropertyOptional({ description: 'User roles' })
  @IsOptional()
  @IsArray()
  roles?: string[];

  @ApiPropertyOptional({ description: 'User permissions' })
  @IsOptional()
  @IsArray()
  permissions?: string[];
}

export class AIStudioUserUpdateDto {
  @ApiPropertyOptional({ description: 'User roles' })
  @IsOptional()
  @IsArray()
  roles?: string[];

  @ApiPropertyOptional({ description: 'User permissions' })
  @IsOptional()
  @IsArray()
  permissions?: string[];

  @ApiPropertyOptional({ description: 'Assigned models' })
  @IsOptional()
  @IsArray()
  assigned_models?: string[];
}

export class AIStudioUserModelUpdateDto {
  @ApiPropertyOptional({ description: 'Favorite models' })
  @IsOptional()
  @IsArray()
  favorite_models?: string[];
}


export class ConversationTopicRequestDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsArray()
  config: AccountConfigDto[];

  @ApiProperty()
  @IsString()
  categoryName: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  active: boolean;
}


class message {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsString()
  role: string;
}

class MockConversation {
  @ApiProperty()
  @IsString()
  experience: string;

  @ApiProperty()
  @IsArray()
  messages: message[];
}

export class ConversationSampleRequestDto extends MockConversation {
  @ApiProperty()
  @IsString()
  account_id: string;

  @ApiProperty()
  @IsString()
  topic_id: string;
}

export class ConversationSampleDto extends ConversationSampleRequestDto {
  static collectionName = 'conversation_samples';

  @ApiPropertyOptional()
  @IsString()
  id: string;
}

// export interface ConversationSampleDto {
//   id: string;
//   account_id: string;
//   topic_id: string;
//   experience: string;
//   messages: Message[];
// }

export class AccountConfigDto {
  @ApiProperty()
  @IsBoolean()
  active: boolean;

  @ApiProperty()
  @IsString()
  account_id: string;

  @ApiProperty()
  @IsInt()
  skill_id: number;

  @ApiProperty()
  @IsString()
  skill_name: string;
}

export class ConversationTopicDto extends ConversationTopicRequestDto {
    static collectionName = 'conversation_topics';

    @ApiPropertyOptional()
    @IsString()
    id?: string;

    @ApiProperty()
    @IsArray()
    config: AccountConfigDto[];

    @ApiPropertyOptional()
    @IsArray()
    conversations: ConversationSampleDto[];

    @ApiPropertyOptional()
    @IsString()
    created_by?: string;

    @ApiPropertyOptional()
    @IsString()
    updated_by?: string;

    @ApiPropertyOptional()
    @IsNumber()
    created_at?: number;

    @ApiPropertyOptional()
    @IsNumber()
    updated_at?: number;
}

export class TaskRequest {
  @ApiProperty()
  @IsString()
  accountId: string;

  @ApiProperty()
  @IsNumber()
  maxConversations: number;

  @ApiProperty()
  @IsNumber()
  concurrentConversations: number;
}

export class ConversationCreationRequest {
  @ApiProperty()
  @IsString()
  accountId: string;

  @ApiProperty({
    description: 'The skill_id of the conversation',
    default: '-1',
  })
  @IsString()
  skillId: string;

  @ApiProperty({
    description: 'The messages of the conversation',
    default: [],
  })
  @IsArray()
  messages: any[];
}


  export class WebViewCommand {
    @ApiProperty({
      description: 'The command',
      default: 'command',
    })
    @IsString()
    command: string;

    @ApiProperty({
      description: 'The site ID',
      default: 'site_id',
    })
    @IsString()
    site_id: string;

    @ApiProperty({
      description: 'The conversation ID',
      default: 'conversationId',
    })
    @IsString()
    conversation_id: string;

    @ApiProperty({
      description: 'The user ID',
      default: 'userId',
    })
    @IsString()
    user_id: string;

    @ApiProperty({
      description: 'The payload',
      default: { name: 'value' },
    })
    payload: any;

    @ApiProperty({
      description: 'The bot ID',
      default: 'botId',
    })
    botId: string;
  }

  // class WebViewRequest(BaseModel):
  //   conversationId: str = Field(description="The conversation ID", example="conversationId")
  //   userId: str = Field(description="The user ID", example="userId")
  //   botId: str = Field(description="The bot ID", example="botId")
  //   message: Optional[str] = Field(description="The message", example="message")
  //   contextVariables: list[dict] = Field(description="The context variables", example={"name": "value"})


  export class WebViewRequest {
    @ApiProperty({
      description: 'The conversation ID',
      default: 'conversationId',
    })
    @IsString()
    conversationId: string;

    @ApiProperty({
      description: 'The user ID',
      default: 'userId',
    })
    @IsString()
    userId: string;

    @ApiProperty({
      description: 'The bot ID',
      default: 'botId',
    })
    @IsString()
    botId: string;

    @ApiProperty({
      description: 'The message',
      default: 'message',
    })
    @IsString()
    message: string;

    @ApiProperty({
      description: 'The context variables',
      default: { name: 'value' },
    })
    contextVariables: any;
  }

  export class AISMessage {
    @ApiProperty()
    @IsString()
    speaker: string;
  
    @ApiProperty()
    @IsString()
    text: string;
  
    @ApiProperty()
    @IsNumber()
    time: number;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    id?: string; // Optional ID for the message
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    tokens?: number; // Optional token count for the message
  }
