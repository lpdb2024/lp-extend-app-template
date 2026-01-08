// AI Studio Helper Types
// Based on LivePerson AI Studio architecture

// Node Base Types (from LangChain)
export type FlowNodeBaseType =
  | 'llm'
  | 'agent'
  | 'tool'
  | 'chain'
  | 'memory'
  | 'prompt'
  | 'embedding'
  | 'retriever';

// Node Parameter Types
export type FlowNodeParamType =
  | 'boolean'
  | 'text'
  | 'number'
  | 'list'
  | 'list_free'
  | 'code_editor'
  | 'knowledgebase'
  | 'kai_knowledgebase'
  | 'lib_prompt'
  | 'prompt_library_manager'
  | 'node'
  | 'key_value'
  | 'key_value_nested'
  | 'output_connect';

// Use Case Types
export type FlowUseCase =
  | 'data_collection'
  | 'guided_routing'
  | 'guided_info'
  | 'conversational_fabric'
  | 'conversational_analysis'
  | 'synthetic_customer'
  | 'guided_routing_v2'
  | 'data_collection_v2';

// Position interface
export interface NodePosition {
  x: number;
  y: number;
}

// Node parameter data
export interface FlowNodeParamData {
  show: boolean;
  value?: unknown;
}

// Node parameter option
export interface FlowNodeParamOption {
  title: string;
  value: string;
  display_conditions?: Record<string, unknown>;
}

// Node parameter definition
export interface FlowNodeParam extends FlowNodeParamData {
  display_name: string;
  description: string;
  param_type: FlowNodeParamType;
  placeholder?: string | null;
  required: boolean;
  advanced: boolean;
  read_only: boolean;
  allowed_node_inputs: Record<string, string[] | Record<string, string[]>>;
  slot_base_type?: FlowNodeBaseType;
  multiple_connections: boolean | number;
  options: FlowNodeParamOption[];
  code_editor_type?: 'python' | 'json' | 'javascript' | 'text';
  code_editor_schema?: unknown;
  variable_extractor?: {
    enabled: boolean;
    extract_to: string;
  };
  display_conditions?: Record<string, unknown>;
  rules?: {
    step?: number;
    min?: number;
    max?: number;
  };
  disabled?: boolean;
}

// Node template (defines node type capabilities)
export interface NodeTemplate {
  type: string;
  display_name: string;
  experimental: boolean;
  base_type: FlowNodeBaseType;
  description: string;
  params: Record<string, FlowNodeParam>;
  hidden: boolean;
  disabled?: boolean;
  roles: string[];
}

// Flow node instance
export interface AIStudioNode {
  id: string;
  type: string;
  base_type: FlowNodeBaseType;
  data: Record<string, FlowNodeParamData>;
  position: NodePosition;
  disabled: boolean;
}

// Flow edge (connection between nodes)
export interface AIStudioEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  disabled: boolean;
}

// Use case mapping for guided flows
export interface FlowUseCaseMapping {
  memory_node_id?: string;
  llm_node_id?: string;
  [key: string]: string | string[] | undefined;
}

// Main flow interface
export interface AIStudioFlow {
  id: string;
  display_name: string;
  description?: string;
  account_id?: string;
  public: boolean;
  created_at: number;
  updated_at: number;
  created_by: string;
  updated_by: string;
  template: boolean;
  template_group?: 'official' | 'community';
  use_case?: FlowUseCase;
  use_case_mapping?: FlowUseCaseMapping;
  version: number;
  cb_tile_metadata?: {
    cb_bot_id?: string;
    cb_bot_name?: string;
    cb_tile_id?: string;
    cb_tile_name?: string;
  };
  agent_widget_enabled: boolean;
  agent_widget_skills: string[];
  generic_tile_enabled: boolean;
  nodes: AIStudioNode[];
  edges: AIStudioEdge[];
}

// Chat message for AI assistant
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  metadata?: {
    flowAction?: 'create_node' | 'update_node' | 'delete_node' | 'create_edge';
    nodeType?: string;
    codeLanguage?: string;
  };
}

// AI assistant context
export interface AIAssistantContext {
  currentFlow: AIStudioFlow | null;
  selectedNode: AIStudioNode | null;
  recentActions: string[];
  userPreferences: {
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    preferredLanguage: string;
  };
}

// Node base type metadata
export interface NodeBaseTypeData {
  type: FlowNodeBaseType;
  title: string;
  icon: string;
  description: string;
  isPlural: boolean;
}

// Flow validation result
export interface FlowValidationResult {
  valid: boolean;
  errors: Array<{
    nodeId?: string;
    edgeId?: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
}

// Node connection validation
export interface ConnectionValidation {
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  valid: boolean;
  reason?: string;
}

// Flow execution result
export interface FlowExecutionResult {
  success: boolean;
  output?: unknown;
  debug?: Array<{
    nodeId: string;
    action: string;
    timestamp: number;
    data?: unknown;
  }>;
  error?: {
    message: string;
    nodeId?: string;
    stack?: string;
  };
}

// Default node templates
export const DEFAULT_NODE_TEMPLATES: NodeTemplate[] = [
  {
    type: 'LPLLMGateway',
    display_name: 'LLM Gateway',
    experimental: false,
    base_type: 'llm',
    description: 'LivePerson LLM Gateway for model access',
    params: {
      subscription_name: {
        display_name: 'Subscription Name',
        description: 'Your LLM subscription name',
        param_type: 'text',
        required: true,
        advanced: false,
        read_only: false,
        allowed_node_inputs: {},
        multiple_connections: false,
        options: [],
        show: true
      },
      llm_provider: {
        display_name: 'LLM Provider',
        description: 'Select the LLM provider',
        param_type: 'list',
        required: true,
        advanced: false,
        read_only: false,
        allowed_node_inputs: {},
        multiple_connections: false,
        options: [
          { title: 'OpenAI Azure', value: 'openai-azure' },
          { title: 'Anthropic', value: 'anthropic' },
          { title: 'Google', value: 'google' },
          { title: 'Amazon', value: 'amazon' }
        ],
        show: true
      }
    },
    hidden: false,
    roles: []
  },
  {
    type: 'LLMChain',
    display_name: 'LLM Chain',
    experimental: false,
    base_type: 'chain',
    description: 'Chain that uses an LLM to process prompts',
    params: {
      llm: {
        display_name: 'LLM',
        description: 'The LLM to use',
        param_type: 'node',
        required: true,
        advanced: false,
        read_only: false,
        allowed_node_inputs: { llm: [] },
        multiple_connections: false,
        options: [],
        show: true
      },
      prompt: {
        display_name: 'Prompt',
        description: 'The prompt template',
        param_type: 'node',
        required: true,
        advanced: false,
        read_only: false,
        allowed_node_inputs: { prompt: [] },
        multiple_connections: false,
        options: [],
        show: true
      }
    },
    hidden: false,
    roles: []
  },
  {
    type: 'LPContextualMemory',
    display_name: 'Contextual Memory',
    experimental: false,
    base_type: 'memory',
    description: 'Stores conversation context and variables',
    params: {
      conversational_slot_key_list: {
        display_name: 'Conversational Slots',
        description: 'Comma-separated list of slot keys to track',
        param_type: 'text',
        required: false,
        advanced: false,
        read_only: false,
        allowed_node_inputs: {},
        multiple_connections: false,
        options: [],
        show: true
      }
    },
    hidden: false,
    roles: []
  },
  {
    type: 'LPPrompt',
    display_name: 'LP Prompt',
    experimental: false,
    base_type: 'prompt',
    description: 'LivePerson prompt template',
    params: {
      template: {
        display_name: 'Template',
        description: 'The prompt template text',
        param_type: 'code_editor',
        code_editor_type: 'text',
        required: true,
        advanced: false,
        read_only: false,
        allowed_node_inputs: {},
        multiple_connections: false,
        options: [],
        show: true
      }
    },
    hidden: false,
    roles: []
  },
  {
    type: 'FilterChain',
    display_name: 'Filter Chain',
    experimental: false,
    base_type: 'chain',
    description: 'Filters or transforms input using Python code',
    params: {
      code: {
        display_name: 'Python Code',
        description: 'Python code to filter/transform input',
        param_type: 'code_editor',
        code_editor_type: 'python',
        required: true,
        advanced: false,
        read_only: false,
        allowed_node_inputs: {},
        multiple_connections: false,
        options: [],
        show: true
      }
    },
    hidden: false,
    roles: []
  },
  {
    type: 'DynamicKAIKnowledgeStore',
    display_name: 'KAI Knowledge Store',
    experimental: false,
    base_type: 'retriever',
    description: 'Retrieves knowledge from KAI knowledge bases',
    params: {
      knowledgebase_id: {
        display_name: 'Knowledge Base ID',
        description: 'The ID of the knowledge base to query',
        param_type: 'kai_knowledgebase',
        required: true,
        advanced: false,
        read_only: false,
        allowed_node_inputs: {},
        multiple_connections: false,
        options: [],
        show: true
      },
      num_results: {
        display_name: 'Number of Results',
        description: 'Maximum number of results to return',
        param_type: 'number',
        required: false,
        advanced: true,
        read_only: false,
        allowed_node_inputs: {},
        multiple_connections: false,
        options: [],
        show: true,
        value: 3,
        rules: { min: 1, max: 10 }
      }
    },
    hidden: false,
    roles: []
  }
];

// Node base type metadata
export const NODE_BASE_TYPE_DATA: Record<FlowNodeBaseType, NodeBaseTypeData> = {
  llm: {
    type: 'llm',
    title: 'LLM',
    icon: 'mdi-lightbulb-outline',
    description: 'Large Language Models for text generation',
    isPlural: true
  },
  agent: {
    type: 'agent',
    title: 'Agent',
    icon: 'mdi-rocket-launch-outline',
    description: 'Autonomous agents that use tools',
    isPlural: true
  },
  tool: {
    type: 'tool',
    title: 'Tool',
    icon: 'mdi-wrench-outline',
    description: 'Tools for agents to use',
    isPlural: true
  },
  chain: {
    type: 'chain',
    title: 'Chain',
    icon: 'mdi-link-variant',
    description: 'Chains that combine components',
    isPlural: true
  },
  memory: {
    type: 'memory',
    title: 'Memory',
    icon: 'mdi-memory',
    description: 'Memory for conversation state',
    isPlural: false
  },
  prompt: {
    type: 'prompt',
    title: 'Prompt',
    icon: 'mdi-text',
    description: 'Prompt templates',
    isPlural: true
  },
  embedding: {
    type: 'embedding',
    title: 'Embedding',
    icon: 'mdi-fingerprint',
    description: 'Text embeddings for similarity',
    isPlural: true
  },
  retriever: {
    type: 'retriever',
    title: 'Retriever',
    icon: 'mdi-vector-polyline',
    description: 'Knowledge retrieval',
    isPlural: true
  }
};

// Use case metadata
export const FLOW_USE_CASE_DATA: Record<FlowUseCase, { title: string; icon: string; description: string }> = {
  data_collection: {
    title: 'Data Collection',
    icon: 'mdi-database-search-outline',
    description: 'Capture data points from conversations'
  },
  guided_routing: {
    title: 'Guided Routing',
    icon: 'mdi-routes',
    description: 'Route consumers to the right agent or skill'
  },
  guided_info: {
    title: 'Information Routing',
    icon: 'mdi-file-search-outline',
    description: 'Route to knowledge articles and agents'
  },
  conversational_fabric: {
    title: 'Conversational Fabric',
    icon: 'mdi-sitemap-outline',
    description: 'Stitch multiple flows together'
  },
  conversational_analysis: {
    title: 'AI Performance Analyst',
    icon: 'mdi-speedometer',
    description: 'Analyze conversation performance'
  },
  synthetic_customer: {
    title: 'Synthetic Customer',
    icon: 'mdi-account-group',
    description: 'Simulate customer personas for testing'
  },
  guided_routing_v2: {
    title: 'Guided Routing v2',
    icon: 'mdi-arrow-decision-outline',
    description: 'Advanced routing with KAI knowledge'
  },
  data_collection_v2: {
    title: 'Data Collection v2',
    icon: 'mdi-checkbox-multiple-marked',
    description: 'Advanced data collection with branching'
  }
};
