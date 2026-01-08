import type {
  NewConversationRequest,
  Domain,
  KVPObject,
  FileUploadMessage,
  // ChangeNotification,
  NotificationBody,
  Change,
  ContentEvent,
  MessagingEvent,
  ClientMessage,
  Dialog,
  CartUpdateSDE,
  transactionSDE,
  ViewedProductSDE,
  LeadSDE,
  ServiceActivitySDE,
  VisitorErrorSDE,
  SearchedContentSDE,
  CustomerInfoSDE,
  PersonalInfoSDE,
  MarketingSourceSDE,
} from "src/interfaces";
import { LPMessagingStore } from "src/stores/WindowAPIStore";
import {
  UMS_TYPES,
  RESPONSE_CODES,
  STAGES,
  CONTENT_TYPES,
} from "src/constants/constants.messaging";
import { v4 as uuidv4 } from "uuid";
interface LPTag {
  wl?: unknown
  scp?: unknown
  site?: string
  section?: string
  tagletSection?: unknown
  autoStart?: boolean
  ovr?: { domain?: string }
  _v?: string
  _tagCount?: number
  protocol?: string
  events?: {
    bind: (t: unknown, e: unknown, i: unknown) => void
    trigger: (t: unknown, e: unknown, i: unknown) => void
    publish: (channel: string, event: string, data: unknown) => void
  }
  defer?: (t: unknown, e: number) => void
  load?: (t?: string, e?: string, i?: string) => void
  _load?: (t?: string, e?: string, i?: string) => void
  init?: () => void
  start?: () => void
  _domReady?: (t: string) => void
  isDom?: boolean
  _timing?: Record<string, number>
  vars?: unknown[]
  dbs?: unknown[]
  ctn?: unknown[]
  sdes?: { send: (sde: unknown) => unknown }
  hooks?: unknown[]
  identities?: unknown[]
  ev?: unknown[]
  sections?: string | string[]
  _defB?: unknown[]
  _defT?: unknown[]
  _defL?: unknown[]
  csds?: { getDomain: (service: string) => string }
  taglets?: { lp_monitoringSDK?: { getSid: () => string; getVid: () => string } }
}

declare const window: Window &
  typeof globalThis & {
    lpTag: LPTag
    attachEvent?: unknown
    _lptStop?: unknown
  };

export const nToBr = (text: string) => {
  try {
    return text.replace(/\n/g, "<br />");
  } catch {
    return text;
  }
};

/* if (!CD.dialogs.find((x: { channelType: string; state: string }) => x.channelType === 'COBROWSE' && x.state === 'OPEN')) { */
export const cobrowseDialog = (dialogs: Dialog[]): Dialog | null => {
  try {
    const found = dialogs.find(
      (x: { channelType: string; state: string }) =>
        x.channelType === "COBROWSE" && x.state === "OPEN"
    );
    return found ?? null;
  } catch {
    return null;
  }
};

export const runLPTag = (args: {
  sections: string[];
  siteId: string;
}): void => {
  try {
    console.info("running LP monitoring tag");
    console.info(args);
    const { sections, siteId } = args;
    /* eslint-disable */
    (window.lpTag = window.lpTag || {}),
      typeof window.lpTag._tagCount === "undefined"
        ? ((window.lpTag = {
            wl: window.lpTag.wl || null,
            scp: window.lpTag.scp || null,
            site: siteId || "",
            section: window.lpTag.section || "",
            tagletSection: window.lpTag.tagletSection || null,
            autoStart: window.lpTag.autoStart !== !1,
            ovr: window.lpTag.ovr || {},
            _v: "1.10.0",
            _tagCount: 1,
            protocol: "https:",
            events: {
              bind: function (t: unknown, e: unknown, i: unknown) {
                window.lpTag.defer?.(function () {
                  window.lpTag.events?.bind(t, e, i);
                }, 0);
              },
              trigger: function (t: unknown, e: unknown, i: unknown) {
                window.lpTag.defer?.(function () {
                  window.lpTag.events?.trigger(t, e, i);
                }, 1);
              },
              publish: function (channel: string, event: string, data: unknown) {
                window.lpTag.defer?.(function () {
                  window.lpTag.events?.publish(channel, event, data);
                }, 0);
              },
            },
            defer: function (t: unknown, e: number) {
              e === 0
                ? ((this._defB = this._defB || []), this._defB.push(t))
                : e === 1
                ? ((this._defT = this._defT || []), this._defT.push(t))
                : ((this._defL = this._defL || []), this._defL.push(t));
            },
            load: function (t?: string, e?: string, i?: string) {
              const n = this;
              setTimeout(function () {
                n._load?.(t, e, i);
              }, 0);
            },
            _load: function (t?: string, e?: string, i?: string) {
              let n = t;
              t ||
                (n =
                  this.protocol +
                  "//" +
                  (this.ovr && this.ovr.domain
                    ? this.ovr.domain
                    : "lptag.liveperson.net") +
                  "/tag/tag.js?site=" +
                  this.site);
              const o = document.createElement("script");
              o.setAttribute("charset", e || "UTF-8"),
                i && o.setAttribute("id", i),
                o.setAttribute("src", n ?? ""),
                document!.getElementsByTagName("head")!.item(0)!.appendChild(o);
            },
            init: function () {
              (this._timing = this._timing || {}),
                (this._timing.start = new Date().getTime());
              const t = this;
              window.attachEvent
                ? (window.attachEvent as any)("onload", function () {
                    t._domReady?.("domReady");
                  })
                : (window.addEventListener(
                    "DOMContentLoaded",
                    function () {
                      t._domReady?.("contReady");
                    },
                    !1
                  ),
                  window.addEventListener(
                    "load",
                    function () {
                      t._domReady?.("domReady");
                    },
                    !1
                  )),
                typeof window._lptStop === "undefined" && this.load?.();
            },
            start: function () {
              this.autoStart = !0;
            },
            _domReady: function (t: string) {
              this.isDom ||
                ((this.isDom = !0),
                this.events?.trigger("LPT", "DOM_READY", { t: t })),
                this._timing && (this._timing[t] = new Date().getTime());
            },
            vars: window.lpTag.vars || [],
            dbs: window.lpTag.dbs || [],
            ctn: window.lpTag.ctn || [],
            sdes: window.lpTag.sdes || { send: () => {} },
            hooks: window.lpTag.hooks || [],
            identities: window.lpTag.identities || [],
            ev: window.lpTag.ev || [],
          }),
          window.lpTag.init?.())
        : (window.lpTag._tagCount += 1);
    window.lpTag.hooks = window.lpTag.hooks || [];
    if (sections) window.lpTag.sections = sections;
  } catch {
    // Silent catch - error ignored
  }
  setTimeout(() => {
    return;
  }, 1000);
};

// lead serviceActivity visitorError searchedContent
export const sendSDE = (
  sde:
    | CartUpdateSDE
    | transactionSDE
    | ViewedProductSDE
    | LeadSDE
    | ServiceActivitySDE
    | VisitorErrorSDE
    | SearchedContentSDE
    | CustomerInfoSDE
    | PersonalInfoSDE
    | MarketingSourceSDE
) => {
  console.info("sending SDE", JSON.stringify(sde));
  console.info(window.lpTag.sdes?.send(sde));
};

interface MessageEventData {
  state: string;
  token: string;
  gatewayDomain: string;
}

export const receiveSecureFormMessage = (event: MessageEvent) => {
  const tokenizerDomain = window.lpTag.csds?.getDomain("tokenizer");
  if (tokenizerDomain && event.origin.includes(tokenizerDomain)) {
    const data: MessageEventData = JSON.parse(event.data);
    const { state, token, gatewayDomain } = data;
    console.info(state, token, gatewayDomain);
    if (state === "submit") {
      return data;
      // this.submitSecureForm(token, this.invitationId);
      // Form was success, lets let the agent know
      // The token is used in step 6
    } else if (state === "error") {
      // Form Failed, do something
      throw new Error("Secure form failed");
    }
  }
};

export const publishCobrowseOffered = (
  serviceId: string,
  agentId: string,
  sessionId: string,
  visitorId: string,
  mode: string,
  visitorName?: string
) => {
  window.lpTag.events?.publish("lpCoBrowse", "cobrowseOffered", {
    serviceId,
    agentId,
    visitorName: visitorName || "visitor",
    mode,
    ssid: sessionId,
    svid: visitorId,
  });
};

export const publishCobrowseAccept = (
  serviceId: string,
  agentId: string,
  ssid: string,
  svid: string
) => {
  window.lpTag.events?.publish("lpCoBrowse", "cobrowseAccepted", {
    serviceId,
    agentId,
    visitorName: null,
    ssid,
    svid,
  });
};
export const publishCobrowseReject = (
  serviceId: string,
  agentId: string,
  ssid: string,
  svid: string
) => {
  window.lpTag.events?.publish("lpCoBrowse", "cobrowseDeclined", {
    serviceId,
    agentId,
    visitorName: null,
    ssid,
    svid,
  });
};
export const generateSecureFormURL = (
  invitationId: string,
  secureFormWriteOtk: string,
  secureFormReadOtk: string
) => {
  const secureFormPayload = {
    siteId: window.lpTag.site,
    locationUrl: `https://${window.lpTag.csds?.getDomain(
      "tokenizer"
    ) ?? ''}/pcigw/pci_dynamic_le.jsp`,
    redirectUrl: `https://${window.lpTag.csds?.getDomain(
      "tokenizer"
    ) ?? ''}/pcigw/pci_dynamic_submitted_le.html`,
    css: "%257B%25221%2522%253A%257B%2522bc%2522%253A%2522%2523FFFFFF%2522%252C%2522f%2522%253A%2522Arial%252CHelvetica%252Csans-serif%2522%252C%2522c%2522%253A%2522%25236D6E70%2522%257D%252C%25222%2522%253A%257B%2522bc%2522%253A%2522%25230363ad%2522%252C%2522c%2522%253A%2522%2523FFFFFF%2522%257D%257D",
    hideLogo: "false",
    invitationId,
    secureFormWriteOtk,
    secureFormReadOtk,
  };
  const url = `${secureFormPayload.locationUrl}?siteid=${secureFormPayload.siteId}&redirect=${secureFormPayload.redirectUrl}&css=${secureFormPayload.css}&hideLogo=${secureFormPayload.hideLogo}&otkJson=${secureFormPayload.siteId}%3A${invitationId}&lang=en-US&otk=${secureFormPayload.secureFormWriteOtk}&formOtk=${secureFormPayload.secureFormReadOtk}`;
  return url;
};

export const mdToLink = (str: string): string | null => {
  try {
    const regex = /\[(.*?)\]\((.*?)\)/g;
    const subst = '<a href="$2" target="_blank">$1</a>';
    str = str.replace(regex, subst);
    str = str.replace(/\n/g, "<br />");
    return str;
  } catch {
    return str;
  }
};

export const formatServices = (baseURIs: Domain[]) => {
  if (!baseURIs) return {};
  const region =
    baseURIs
      .find((x: Domain) => x.service === "leDataReporting")
      ?.baseURI.substring(0, 2) || "";
  const accountConfig = baseURIs.find(
    (x) => x.service === "accountConfigReadOnly"
  );
  const zone = accountConfig ? accountConfig.baseURI.substring(0, 2) : "";
  const service: KVPObject = {};
  for (const i in baseURIs) {
    if (baseURIs[i]) {
      service[baseURIs[i].service] = baseURIs[i].baseURI;
    }
  }
  service.proactiveHandoff = `${region}.sy.handoff.liveperson.net`;
  service.convBuild = `${region}.bc-sso.liveperson.net`;
  service.bcmgmt = `${region}.bc-mgmt.liveperson.net`;
  service.bcintg = `${region}.bc-intg.liveperson.net`;
  service.bcnlu = `${region}.bc-nlu.liveperson.net`;
  service.bot = `${region}.bc-bot.liveperson.net`;
  service.botPlatform = `${region}.bc-platform.liveperson.net`;
  service.kb = `${region}.bc-kb.liveperson.net`;
  service.context = `${region}.context.liveperson.net`;
  service.recommendation = `${zone}.askmaven.liveperson.net`;
  service.idp = `${region}.idp.liveperson.net`;
  service.proactive = `proactive-messaging.${zone}.fs.liveperson.com`;
  service.maven = `${zone}.maven.liveperson.net`;
  return service;
};

export const getLPSession = async (): Promise<
  { sessionId: string; visitorId: string } | undefined
> => {
  return new Promise(function (resolve) {
    setInterval(function () {
      if (window?.lpTag?.taglets?.lp_monitoringSDK) {
        const sessionId = window.lpTag.taglets.lp_monitoringSDK.getSid();
        const visitorId = window.lpTag.taglets.lp_monitoringSDK.getVid();
        if (sessionId && visitorId) {
          resolve({ sessionId, visitorId });
          return { sessionId, visitorId };
        }
      }
    }, 1000);
  });
};

export const findOpenStageDialog = (body: NotificationBody): Change | null => {
  if (!body?.changes || body.changes.length === 0) return null;
  let found: Change | null = null;
  body.changes.forEach((change: Change) => {
    if (change?.result?.conversationDetails?.stage === STAGES.OPEN) {
      found = change;
    }
  });
  return found;
};

export const getMessageCount = (changes: MessagingEvent[]): number => {
  let count = 0;
  // const messageCount = count of all changes where = change.event.type == 'RichContentEvent' or change.event.type == 'ContentEvent'

  changes.forEach((change) => {
    if (
      change.event.type === "RichContentEvent" ||
      change.event.type === "ContentEvent"
    ) {
      count++;
    }
  });
  return count;
};

export const lastIndex = <T>(array: T[]) => {
  try {
    return array.length - 1;
  } catch {
    return -1;
  }
};

export const formatMessages = (messages: string[]) => {
  const msgs = [];
  try {
    for (const message of messages) {
      const regex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/g;
      const newMessage = message.replace(regex, '<a target="_blank" href="$1"');
      msgs.push(newMessage);
    }
  } catch {
    return messages;
  }
  return msgs;
};

export class UMS {
  initRequest(jwt: string) {
    return {
      id: RESPONSE_CODES.INIT_CONNECTION,
      kind: "req",
      type: "InitConnection",
      body: {},
      headers: [
        {
          type: ".ams.headers.ConsumerAuthentication",
          jwt,
        },
        {
          type: ".ams.headers.ClientProperties",
          os: window.navigator.userAgent,
          features: [
            "AUTO_MESSAGES",
            "RICH_CONTENT",
            "CO_BROWSE",
            "PHOTO_SHARING",
            "QUICK_REPLIES",
            "MULTI_DIALOG",
            "FILE_SHARING",
            "MARKDOWN_HYPERLINKS",
          ],
          appId: "webAsync",
          integrationVersion: "3.0.62",
          integration: "WEB_SDK",
          timeZone: "Australia/Sydney",
        },
      ],
    };
  }

  subscribeExConversations() {
    return {
      kind: "req",
      id: RESPONSE_CODES.SUBSCRIBE_EX_CONVERSATIONS,
      type: UMS_TYPES.SUBSCRIBE_EX_CONVERSATIONS,
      body: {
        stage: ["OPEN", "CLOSE", "LOCKED"],
        convState: ["OPEN", "CLOSE", "LOCKED"],
      },
    };
  }

  userProfile() {
    return {
      kind: "req",
      id: RESPONSE_CODES.GET_USER_PROFILE,
      type: "userprofile.GetUserProfile",
      body: {},
    };
  }

  subscribeEvents(conversationId: string, dialogId: string) {
    return {
      kind: "req",
      id: RESPONSE_CODES.SUBSCRIBE_MESSAGING_EVENTS,
      body: {
        fromSeq: 0,
        conversationId,
        dialogId,
      },
      type: "ms.SubscribeMessagingEvents",
    };
  }

  subscribeSurveyEvents(conversationId: string, dialogId: string) {
    return {
      kind: "req",
      id: RESPONSE_CODES.SUBSCRIBE_EX_CONVERSATIONS_SURVEYS,
      type: "cqm.SubscribeExConversations",
      body: {
        conversationId,
        dialogId: dialogId || conversationId,
      },
    };
  }

  closeConversation(conversationId: string) {
    return {
      kind: "req",
      id: RESPONSE_CODES.UPDATE_CONVERSATION_FIELD_CLOSE_CONVERSATION,
      type: "cm.UpdateConversationField",
      body: {
        conversationId,
        conversationField: {
          field: "Stage",
          conversationState: "CLOSE",
        },
      },
    };
  }

  closeDialog(conversationId: string, dialogId: string) {
    return {
      kind: "req",
      id: RESPONSE_CODES.UPDATE_CONVERSATION_FIELD_CLOSE_DIALOG,
      type: "cm.UpdateConversationField",
      body: {
        conversationId,
        conversationField: {
          field: "DialogChange",
          type: "UPDATE",
          dialog: {
            dialogId,
            state: "CLOSE",
            closedCause: "Closed by consumer",
          },
        },
      },
    };
  }

  sendMessage(conversationId: string, dialogId: string, message: string) {
    return {
      kind: "req",
      id: `consumer_${uuidv4()}`,
      type: "ms.PublishEvent",
      body: {
        conversationId,
        dialogId,
        event: {
          type: "ContentEvent",
          contentType: "text/plain",
          message,
        },
      },
    };
  }

  newConversation(
    skillId: string,
    visitorId: string,
    sessionId: string,
    campaignId: string | null | undefined,
    engagementId: string | null | undefined
  ) {
    const config: NewConversationRequest = {
      kind: "req",
      id: RESPONSE_CODES.REQUEST_CONVERSATION,
      type: "cm.ConsumerRequestConversation",
      body: {
        skillId,
        channelType: "MESSAGING",
        ttrDefName: null,
        conversationContext: {
          visitorId,
          sessionId,
          interactionContextId: "1",
          type: "SharkContext",
          lang: "en-US",
        },
      },
    };
    if (campaignId && engagementId) {
      config.body.campaignInfo = { campaignId, engagementId };
    }
    return config;
  }

  threadMessage(
    change: MessagingEvent,
    isAgent: boolean,
    from: string
  ): ClientMessage {
    const {
      dialogId,
      originatorMetadata,
      serverTimestamp,
      originatorId,
      sequence,
    } = change;

    const message = String((change.event as ContentEvent).message);

    const p: ClientMessage = {
      content: "",
      metadata: change.metadata ?? [],
      uid: sequence + "-" + dialogId,
      serverTimestamp,
      timeLocal: Date.now(),
      originatorId,
      dialogId,
      isAgent,
      agentId: originatorMetadata.id,
      status: "SENT",
      message,
      sequence,
      from,
      role: originatorMetadata.role,
      type: "text",
      quickReplies: [],
      isReplies: false,
    };

    const x = (change.event as ContentEvent).message as FileUploadMessage;
    if (x.relativePath !== undefined) {
      p.caption = x.caption;
      p.relativePath = x.relativePath;
      p.fileType = x.fileType;
      p.preview = x.preview;
      p.type = "file";
    }

    const quickReplies = (change.event as ContentEvent).quickReplies;
    if (quickReplies && quickReplies.replies) {
      p.quickReplies = quickReplies.replies;
      p.isReplies = true;
    }
    if (
      (change.event as ContentEvent)?.contentType ===
      CONTENT_TYPES.SECURE_FORM_INVITATION
    ) {
      const timeout = LPMessagingStore().secureFormTimeout;
      const expired = serverTimestamp + timeout < Date.now();
      p.isSecureForm = true;
      p.expired = expired;
    }
    return p;
  }

  secureFormSubmit(
    dialogId: string,
    conversationId: string,
    submissionId: string,
    invitationId: string
  ) {
    return {
      type: "ms.PublishEvent",
      body: {
        dialogId,
        conversationId,
        event: {
          type: "ContentEvent",
          contentType: "forms/secure-submission",
          message: {
            submissionId,
            invitationId,
          },
        },
      },
      id: `secure-form-submit-${invitationId}`,
      kind: "req",
    };
  }

  secureFormUploadToken(
    formId: string,
    invitationId: string,
    dialogId: string
  ) {
    return {
      type: "ms.GenerateUploadToken",
      body: {
        uploadable: {
          formId,
          invitationId,
          type: "SecureForm",
          dialogId,
        },
      },
      id: invitationId,
      kind: "req",
    };
  }

  requestFileUpload(fileSize: number, fileType: string) {
    return {
      kind: "req",
      id: 1,
      body: {
        fileSize,
        fileType,
      },
      type: "ms.GenerateURLForUploadFile",
    };
  }

  publishUpload(
    caption: string,
    relativePath: string,
    fileType: string,
    preview: string,
    dialogId: string,
    conversationId: string
  ) {
    return {
      kind: "req",
      id: 519,
      body: {
        dialogId,
        conversationId,
        event: {
          type: "ContentEvent",
          contentType: "hosted/file",
          message: {
            caption,
            relativePath,
            fileType,
            preview,
          },
        },
      },
      type: "ms.PublishEvent",
    };
  }
}
