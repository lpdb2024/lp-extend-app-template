
/* eslint-disable @typescript-eslint/no-explicit-any */

// import { jwtDecode } from 'jwt-decode'

import { defineStore } from 'pinia'
// import axios from 'axios'
// import { Notify } from 'quasar'
// import { ACTION_KEYS, API_ROUTES } from 'src/constants'
// import ApiService from 'src/services/ApiService'
// import ErrorService from 'src/services/ErrorService'
// import { LocalStorageCache } from 'src/services/StorageCache'
import type { AUTH, CB_AUTH } from 'src/interfaces'
// import { KVPObject } from 'src/interfaces'
// import { useUserStore } from './store-user'
// const cache = new LocalStorageCache()

// const router = useRouter()
// const debug = true
// const sessionLength = 4 * (1000 * 60 * 60)
// let proactveRetry = 3
// let proactveHandoffRetry = 1
// let cbAuthRetry = 1
// function notifyError (args: any) {
//   const message: string = args.message || null
//   const caption: string = args.caption || null
//   const actions: object[] = args.actions || null
//   Notify.create({
//     message,
//     caption,
//     icon: 'o_error_outline',
//     position: 'top',
//     classes: 'error-banner',
//     actions
//   })
// }

const proactiveConfig: object = {
}

const identity: object = {
}

const siteId: string | null = null
interface IpiniaState {
  AUTHMAP: object | null,
  identity: object | null,
  recentAccounts: any[],
  AUTH_TOKEN: string | null,
  AUTH_TOKEN_EXP: string | null,
  siteId: string | null,
  CB_AUTH: CB_AUTH | null,
  AUTH: AUTH | null,
  proactiveConfig: object | null,
  proactiveToken: string | null,
  refreshLoginSignal: number | null,
  ZONE: string | null,
  TOKEN: string | null
}
const piniaState: IpiniaState = {
  ZONE: null,
  AUTHMAP: null,
  identity,
  recentAccounts: [],
  AUTH_TOKEN: null,
  AUTH_TOKEN_EXP: null,
  siteId,
  CB_AUTH: {
    chatBotPlatformUser: null,
    apiAccessToken: null,
    apiAccessPermToken: null,
    config: null,
    sessionOrganizationId: null,
    leAccountId: null,
    cbRegion: null,
    enabledFeatures: null,
    siteSettings: null,
    leUserId: null,
    privileges: null,
    isElevatedLpa: null
  },
  AUTH: {
    access_token: null,
    token_type: null,
    refresh_token: null,
    id_token: null,
    expires_in: null,
    decoded: null,
    expiresIn: null
  },
  proactiveConfig,
  proactiveToken: null,
  refreshLoginSignal: null,
  TOKEN: null
}

export const useAuthStore = defineStore('useAuthStore', {
  persist: true,
  state: () => (piniaState),
  getters: {},
  actions: {}
})
