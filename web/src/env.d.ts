declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}

// eXtend version constants injected via quasar.config.ts rawDefine
declare const __EXTEND_TEMPLATE_VERSION__: string;
declare const __EXTEND_CLIENT_SDK_VERSION__: string;
