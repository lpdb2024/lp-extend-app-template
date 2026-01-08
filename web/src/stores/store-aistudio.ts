/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiService from "src/services/ApiService";
import ErrorService from "src/services/ErrorService";
const handleRequestError = ErrorService.handleRequestError.bind(ErrorService);
import { defineStore } from "pinia";

import { API_ROUTES_AI_STUDIO, AIS_ACTION_KEYS, ACTION_KEYS_AI_STUDIO } from "src/constants";
import type { AISFlow } from "src/interfaces";
import { useUserStore } from "./store-user";
import type {
  AIStudioFlow,
  AIStudioNode,
  AIStudioEdge,
  NodeTemplate,
  ChatMessage,
  FlowValidationResult,
} from "src/types/aistudio.types";
import { DEFAULT_NODE_TEMPLATES } from "src/types/aistudio.types";

// Re-export types for consumers
export type { AIStudioFlow, AIStudioNode, AIStudioEdge, NodeTemplate, ChatMessage, FlowValidationResult };

interface IUserState {
  // Original state
  flows: AISFlow[] | null;

  // AI Studio Helper state
  helperFlows: AIStudioFlow[];
  selectedFlowId: string | null;
  loading: boolean;
  saving: boolean;
  nodeTemplates: NodeTemplate[];
  templatesLoaded: boolean;
  isDirty: boolean;
  undoStack: AIStudioFlow[];
  redoStack: AIStudioFlow[];
  chatMessages: ChatMessage[];
  isAssistantThinking: boolean;
  validationResults: FlowValidationResult | null;
}

export const useAIStudioStore = defineStore("aisstore", {
  state: (): IUserState => ({
    // Original state
    flows: null,

    // AI Studio Helper state
    helperFlows: [],
    selectedFlowId: null,
    loading: false,
    saving: false,
    nodeTemplates: DEFAULT_NODE_TEMPLATES,
    templatesLoaded: false,
    isDirty: false,
    undoStack: [],
    redoStack: [],
    chatMessages: [],
    isAssistantThinking: false,
    validationResults: null,
  }),
  persist: {
    storage: localStorage,
  },
  getters: {
    selectedFlow(state): AIStudioFlow | null {
      return state.helperFlows.find((f: { id: string | null; }) => f.id === state.selectedFlowId) || null;
    },

    templatesByBaseType(state): Record<string, NodeTemplate[]> {
      return state.nodeTemplates.reduce<Record<string, NodeTemplate[]>>((acc: { [x: string]: any[]; }, template: { base_type: string; }) => {
        const type: string = template.base_type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(template);
        return acc;
      }, {} as Record<string, NodeTemplate[]>);
    },

    canUndo(state): boolean {
      return state.undoStack.length > 0;
    },

    canRedo(state): boolean {
      return state.redoStack.length > 0;
    },
  },
  actions: {
    // Original actions
    async getFlows(useCache?: boolean): Promise<any> {
      try {
        if (useCache && this.flows) {
          return this.flows;
        }
        const accountId = useUserStore().accountId;
        if (!accountId) {
          throw new Error("accountId is not defined");
        }
        const actionKey = AIS_ACTION_KEYS.LIST_FLOWS;
        const url = API_ROUTES_AI_STUDIO.LIST_FLOWS(accountId);
        const { data } = await ApiService.get<any>(url, actionKey);
        if (data?.flows && data?.flows.length > 0) {
          this.flows = data.flows;
        } else {
          this.flows = null;
        }
        return data.flows;
      } catch (error) {
        handleRequestError(error, true);
      }
    },

    async getFlowDetails(flowId: string): Promise<any> {
      try {
        const accountId = useUserStore().accountId;
        if (!accountId) {
          throw new Error("accountId is not defined");
        }
        const actionKey = ACTION_KEYS_AI_STUDIO.GET_FLOW;
        const url = API_ROUTES_AI_STUDIO.FLOW(accountId, flowId);
        const { data } = await ApiService.get<any>(url, actionKey);
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },

    async invokeFlow(flowId: string, body: any): Promise<any> {
      try {
        const accountId = useUserStore().accountId;
        if (!accountId) {
          throw new Error("accountId is not defined");
        }
        const actionKey = AIS_ACTION_KEYS.INVOKE_FLOW;
        const url = API_ROUTES_AI_STUDIO.INVOKE_FLOW(accountId, flowId);
        const { data } = await ApiService.post<any>(url, body, actionKey);
        return data[0];
      } catch (error) {
        handleRequestError(error, true);
      }
    },

    // AI Studio Helper actions
    async fetchNodeTemplates() {
      if (this.templatesLoaded) return;

      this.loading = true;
      try {
        // In production, this would fetch from AI Studio API
        await new Promise((resolve) => setTimeout(resolve, 300));
        this.templatesLoaded = true;
      } catch (error) {
        console.error("Failed to fetch node templates:", error);
      } finally {
        this.loading = false;
      }
    },

    selectFlow(flowId: string | null) {
      this.selectedFlowId = flowId;
      this.isDirty = false;
      this.undoStack = [];
      this.redoStack = [];
      this.validationResults = null;
    },

    createFlow(flow: Partial<AIStudioFlow>): AIStudioFlow {
      const newFlow: AIStudioFlow = {
        id: `flow-${Date.now()}`,
        display_name: flow.display_name || "New Flow",
        description: flow.description || "",
        nodes: flow.nodes || [],
        edges: flow.edges || [],
        created_at: Date.now(),
        updated_at: Date.now(),
        version: 1,
        public: false,
        template: false,
        created_by: "",
        updated_by: "",
        agent_widget_enabled: false,
        agent_widget_skills: [],
        generic_tile_enabled: false,
        ...flow,
      };

      this.helperFlows.push(newFlow);
      this.selectedFlowId = newFlow.id;
      this.isDirty = true;

      return newFlow;
    },

    async saveFlow(flowId?: string): Promise<boolean> {
      const id = flowId || this.selectedFlowId;
      const flow = this.helperFlows.find((f: { id: string | null; }) => f.id === id);
      if (!flow) return false;

      this.saving = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        flow.updated_at = Date.now();
        flow.version += 1;
        this.isDirty = false;
        return true;
      } catch (error) {
        console.error("Failed to save flow:", error);
        return false;
      } finally {
        this.saving = false;
      }
    },

    async deleteFlow(flowId: string): Promise<boolean> {
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const index = this.helperFlows.findIndex((f: { id: string; }) => f.id === flowId);
        if (index !== -1) {
          this.helperFlows.splice(index, 1);
          if (this.selectedFlowId === flowId) {
            this.selectedFlowId = null;
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to delete flow:", error);
        return false;
      }
    },

    // Node Operations
    addNode(node: AIStudioNode) {
      const flow = this.selectedFlow;
      if (!flow) return;

      this.saveToUndoStack();
      flow.nodes.push(node);
      this.isDirty = true;
    },

    updateNode(nodeId: string, updates: Partial<AIStudioNode>) {
      const flow = this.selectedFlow;
      if (!flow) return;

      this.saveToUndoStack();
      const index = flow.nodes.findIndex((n: AIStudioNode) => n.id === nodeId);
      const existingNode = flow.nodes[index];
      if (index !== -1 && existingNode) {
        flow.nodes[index] = {
          id: updates.id ?? existingNode.id,
          type: updates.type ?? existingNode.type,
          base_type: updates.base_type ?? existingNode.base_type,
          data: updates.data ?? existingNode.data,
          position: updates.position ?? existingNode.position,
          disabled: updates.disabled ?? existingNode.disabled,
        };
        this.isDirty = true;
      }
    },

    removeNode(nodeId: string) {
      const flow = this.selectedFlow;
      if (!flow) return;

      this.saveToUndoStack();
      flow.nodes = flow.nodes.filter((n: { id: string; }) => n.id !== nodeId);
      flow.edges = flow.edges.filter(
        (e: { source: string; target: string; }) => e.source !== nodeId && e.target !== nodeId
      );
      this.isDirty = true;
    },

    // Edge Operations
    addEdge(edge: AIStudioEdge) {
      const flow = this.selectedFlow;
      if (!flow) return;

      const exists = flow.edges.some(
        (e) =>
          e.source === edge.source &&
          e.target === edge.target &&
          e.sourceHandle === edge.sourceHandle &&
          e.targetHandle === edge.targetHandle
      );

      if (!exists) {
        this.saveToUndoStack();
        flow.edges.push(edge);
        this.isDirty = true;
      }
    },

    removeEdge(edgeId: string) {
      const flow = this.selectedFlow;
      if (!flow) return;

      this.saveToUndoStack();
      flow.edges = flow.edges.filter((e: { id: string; }) => e.id !== edgeId);
      this.isDirty = true;
    },

    // Undo/Redo
    saveToUndoStack() {
      const flow = this.selectedFlow;
      if (!flow) return;

      this.undoStack.push(JSON.parse(JSON.stringify(flow)));
      this.redoStack = [];

      if (this.undoStack.length > 50) {
        this.undoStack.shift();
      }
    },

    undo() {
      if (!this.canUndo || !this.selectedFlow) return;

      const previousState = this.undoStack.pop();
      if (previousState) {
        this.redoStack.push(JSON.parse(JSON.stringify(this.selectedFlow)));
        const index = this.helperFlows.findIndex((f: { id: string | null; }) => f.id === this.selectedFlowId);
        if (index !== -1) {
          this.helperFlows[index] = previousState;
        }
      }
    },

    redo() {
      if (!this.canRedo || !this.selectedFlow) return;

      const nextState = this.redoStack.pop();
      if (nextState) {
        this.undoStack.push(JSON.parse(JSON.stringify(this.selectedFlow)));
        const index = this.helperFlows.findIndex((f: { id: string | null; }) => f.id === this.selectedFlowId);
        if (index !== -1) {
          this.helperFlows[index] = nextState;
        }
      }
    },

    // Validation
    validateFlow(): FlowValidationResult {
      const flow = this.selectedFlow;
      if (!flow) {
        return {
          valid: false,
          errors: [{ message: "No flow selected", severity: "error" }],
        };
      }

      const errors: FlowValidationResult["errors"] = [];

      if (flow.nodes.length === 0) {
        errors.push({ message: "Flow has no nodes", severity: "warning" });
      }

      const connectedNodeIds = new Set<string>();
      flow.edges.forEach((edge: { source: string; target: string; }) => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      });

      flow.nodes.forEach((node: { id: string; type: any; }) => {
        if (!connectedNodeIds.has(node.id) && flow.nodes.length > 1) {
          errors.push({
            nodeId: node.id,
            message: `Node "${node.type}" is not connected`,
            severity: "warning",
          });
        }
      });

      this.validationResults = {
        valid: errors.filter((e: { severity: string; }) => e.severity === "error").length === 0,
        errors,
      };

      return this.validationResults;
    },

    // AI Assistant
    addChatMessage(message: ChatMessage) {
      this.chatMessages.push({
        ...message,
        timestamp: Date.now(),
      });
    },

    clearChatHistory() {
      this.chatMessages = [];
    },

    async sendToAssistant(message: string): Promise<string> {
      this.isAssistantThinking = true;
      this.addChatMessage({ role: "user", content: message });

      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const response = this.generateAssistantResponse(message);
        this.addChatMessage({ role: "assistant", content: response });
        return response;
      } finally {
        this.isAssistantThinking = false;
      }
    },

    generateAssistantResponse(message: string): string {
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes("data collection")) {
        return `To create a **Data Collection** flow, you'll need:

1. **LPContextualMemory** - Stores conversation variables
2. **LPPrompt** - Defines the collection prompts
3. **LLMChain** - Processes user responses
4. **LPLLMGateway** - Connects to the LLM

Would you like me to create this structure for you?`;
      }

      if (lowerMessage.includes("guided routing")) {
        return `A **Guided Routing** flow routes users to the right skill based on intent:

1. Configure intents in the flow form
2. Add knowledge sources for each route
3. Define fallback behavior

The system will analyze user messages and route accordingly.`;
      }

      if (lowerMessage.includes("python") || lowerMessage.includes("code")) {
        return `Here's a Python code template for filtering:

\`\`\`python
def process(input_data):
    # Your filtering logic
    result = input_data.strip().lower()
    return result
\`\`\`

You can use this in a **FilterChain** node.`;
      }

      return `I can help you with:

• **Creating flows** - Describe your use case
• **Configuring nodes** - Explain parameters
• **Writing Python code** - Custom filters and tools
• **Debugging** - Troubleshoot issues

What would you like to do?`;
    },
  },
});
