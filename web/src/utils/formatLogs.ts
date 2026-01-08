import type { DebugLog, KVPObject } from "src/interfaces";
import { findJSON } from "src/utils/functions";
export const logTags = {
  DEBUG_MESSAGE: "DEBUG_MESSAGE",
  ERROR: "error",
  JSON: "JSON",
  GENERATIVE_AI: "Generative AI",
  PATTERN_MATCH: "Pattern Match",
  WEB_VIEW: "Web View",
  INTERMEDIATE_MESSAGE: "Intermediate Message",
  JAVASCRIPT_EXECUTION: "Javascript Execution",
  SECURE_FORM: "Secure Form",
  BOOKMARK: "Bookmark",
  BOT_RESPONSE: "Bot Response",
  BOT_TRANSFER: "Bot Transfer",
  USER_MESSAGE: "User Message",
  SYSTEM_EVENT: "System Event",
  DIALOG_PROCESSING: "Dialog Processing",
  NLU: "NLU",
  INTERACTION_PROCESSING: "Interaction Processing",
  SLOTS: "Slots",
  CUSTOM_RULES: "Custom Rules",
  KB_SEARCH: "KB Search",
  GLOBAL_FUNCTION: "Global Function",
  DISAMBIGUATION: "Disambiguation",
  MULTIFILE_UPLOAD: "Multifile Upload",
  VOICE: "Voice",
  DYNAMIC_ROUTING: "Dynamic Routing",
  SMALL_TALK: "Small Talk",
  ESCALATION: "Escalation",
  GUIDED_ROUTING_RUNTIME: "Guided Routing Runtime",
  INTEGRATION_PROCESSING: "Integration Processing",
  QUICK_REPLY: "Quick reply",
  NODE_PROCESSING: "Node Processing",
};

export const types: KVPObject = {
  INTERACTION_NOT_IN_PROGRESS: "Interaction not in progress",
  DEBUG_LOG: "Botcontext Logs",
  GLOBAL_FUNCTION_MESSAGES: "Processing global function messages",
  PROCESS_MESSAGES: "Process inserted messages for text:",
  DIALOG_START: "Starting dialog with conversation Id:",
  MATCHED: "Matched Logs",
  DIALOG_MATCHED: "Dialog starter match",
  NEXT_MESSAGE: "Trigger next message",
  NEXT_INTERACTION: "Triggering next interaction",
  DIALOG_START_LOGS: "Dialog Starter Logs",
  INVOKE_NLP: "Invoking NLP processor for chat message text:",
  PROCESS_INTERACTION: "Processing interaction",
  PROCESS_CONTENT: "Processing content of the message for Message:",
  PROCESS_QUICK_REPLY: "Processing Quick reply for message:",
  MOVING_NEXT_INTERACTION: "Moving to next interaction",
  PRE_PROCESS: "Processing preProcessMessage JavaScript with message:",
  INTERACTION_MATCHED: "Interaction matched",
  PROCESS_INTEGRATION: "Integration Processing",
  CHECK_KB_MATCH: "Check KB match with chat message:",
  POST_PROCESS: "Processing postProcessMessage for message:",
  COMPLETED_RESPONSE_MATCH: "Response match completed for the message:",
  PROCESSING_LOGS: "Processing Logs",
  EXECUTION_LOGS: "Execution Logs",
};

const getLocation = (log: DebugLog) => {
  const int = log?.content?.description?.find(
    (d) => d.key.toLowerCase() === "interaction"
  )?.value;
  if (int) {
    console.info("int", int);
    return int;
  }

  const intName = log?.content?.description?.find(
    (d) => d.key.toLowerCase() === "interaction name"
  )?.value;
  if (intName) return intName;

  const jsCode = log?.content?.description?.find(
    (d) => d.key.toLowerCase() === "javascript code"
  )?.value;
  if (jsCode) return jsCode;
};

const getType = (log: DebugLog) => {
  const title = log?.content?.title;
  if (!title) return null;
  for (const key in types) {
    if (title.toLowerCase().includes(String(types[key]).toLowerCase())) {
      return key;
    }
  }
  return null;
};

export const LOG_ITEM_TYPES = {
  CONTEXT_WAREHOUSE: "context_warehouse",
  NO_MATCH: "no_match",
  DEBUG_MESSAGE: "debugMessage",
  SEND_MESSAGE: "sendMessage",
  MATCHING: "matching",
  MATCH: "match",
  PROCESSING: "processing",
  ERROR: "error",
  API: "API",
  JSON: "JSON",
  API_FAIL: "APIFAIL",
  END: "end",
  START: "start",
  SUCCESS: "success",
  GENERAL: "general",
};

const isErrorLog = (log: DebugLog) => {
  if (log.level.toLowerCase() === "error") return true;
  if (log.level.toLowerCase() === "warn") return true;
  if (log.message.toLowerCase().includes("error")) return true;
  return false;
};
const getTags = (log: DebugLog) => {
  const msg = log.message;
  if (msg.toLowerCase().includes("debug message"))
    log.tags = [...log.tags, "DEBUG_MESSAGE"];
  if (isErrorLog(log)) {
    console.info(log);
    log.tags = [...log.tags, "ERROR"];
  }
  if (findJSON(log.message)) log.tags = [...log.tags, "JSON"];

  return log.tags || [];
};

export const formatLogs = (logs: DebugLog[]): DebugLog[] => {
  return logs.map((log) => {
    return {
      ...log,
      location: getLocation(log) ?? "",
      type: getType(log) as string,
      json: findJSON(log.message) || null,
      tags: getTags(log),
    };
  });
};
