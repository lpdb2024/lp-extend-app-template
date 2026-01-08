/**
 * FaaS Store
 * Pinia store for LivePerson Functions (FaaS) data
 * Manages Lambdas, Schedules, and Proxy Settings
 */

import { defineStore } from 'pinia'
import { useUserStore } from './store-user'
import ApiService from 'src/services/ApiService'
import ErrorService from 'src/services/ErrorService'
import { FAAS_ROUTES, ACTION_KEYS_AC } from 'src/constants'

const handleRequestError = ErrorService.handleRequestError.bind(ErrorService)

// ============================================================================
// Interfaces
// ============================================================================

export interface LambdaRuntime {
  uuid: string
  name: string
  baseImageName: string
}

export interface LambdaDeployment {
  uuid: string
  name: string
  lambdaUUID: string
  lambdaVersion: number
  createdAt: string
  deployedAt: string
  createdBy: string
  imageName: string
  deploymentState: string
  lambdaImageVersion: string | null
}

export interface LambdaImplementation {
  code: string
  dependencies: string[]
  environmentVariables: { key: string; value: string }[]
}

export interface Lambda {
  uuid: string
  version: number
  name: string
  description: string
  samplePayload: { headers: unknown[]; payload: Record<string, unknown> }
  state: 'Draft' | 'Productive' | 'Modified'
  runtime: LambdaRuntime
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  minInstances: number
  size: 'S' | 'M' | 'L' | 'XL'
  skills: string[]
  eventId?: string
  lastDeployment?: LambdaDeployment
  implementation: LambdaImplementation
}

export interface FaaSSchedule {
  uuid: string
  lambdaUUID: string
  isActive: boolean
  cronExpression: string
  didLastExecutionFail: boolean
  lastExecution: string
  nextExecution: string
  createdBy: string
  invocationBody: {
    payload: Record<string, unknown>
    headers: unknown[]
  }
}

export interface FaaSProxySetting {
  id: number
  domain: string
  name: string
}

// ============================================================================
// State Interface
// ============================================================================

interface FaaSState {
  lambdas: Lambda[]
  schedules: FaaSSchedule[]
  proxySettings: FaaSProxySetting[]
  loading: {
    lambdas: boolean
    schedules: boolean
    proxySettings: boolean
    all: boolean
  }
  lastFetched: {
    lambdas: number | null
    schedules: number | null
    proxySettings: number | null
  }
}

// ============================================================================
// Store Definition
// ============================================================================

export const useFaaSStore = defineStore('faas', {
  state: (): FaaSState => ({
    lambdas: [],
    schedules: [],
    proxySettings: [],
    loading: {
      lambdas: false,
      schedules: false,
      proxySettings: false,
      all: false,
    },
    lastFetched: {
      lambdas: null,
      schedules: null,
      proxySettings: null,
    },
  }),

  getters: {
    accountId(): string | null {
      const userStore = useUserStore()
      return userStore.accountId || null
    },

    hasData(): boolean {
      return this.lambdas.length > 0 || this.schedules.length > 0 || this.proxySettings.length > 0
    },

    productiveLambdas(): Lambda[] {
      return this.lambdas.filter(l => l.state === 'Productive')
    },

    draftLambdas(): Lambda[] {
      return this.lambdas.filter(l => l.state === 'Draft')
    },

    activeSchedules(): FaaSSchedule[] {
      return this.schedules.filter(s => s.isActive)
    },

    customProxySettings(): FaaSProxySetting[] {
      return this.proxySettings.filter(p => !p.name.startsWith('faas_default_'))
    },

    entityCounts(): { lambdas: number; schedules: number; proxySettings: number } {
      return {
        lambdas: this.lambdas.length,
        schedules: this.schedules.length,
        proxySettings: this.proxySettings.length,
      }
    },
  },

  actions: {
    // ========================================================================
    // Lambdas
    // ========================================================================

    async fetchLambdas(useCache = false): Promise<Lambda[]> {
      if (useCache && this.lambdas.length > 0) return this.lambdas

      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.lambdas = true
      try {
        const url = FAAS_ROUTES.LAMBDAS(accountId)
        const { data } = await ApiService.get<{ data: Lambda[] }>(url, ACTION_KEYS_AC.FAAS_LAMBDAS_GET)
        this.lambdas = data?.data || data || []
        this.lastFetched.lambdas = Date.now()
        return this.lambdas
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.lambdas = false
      }
    },

    // ========================================================================
    // Schedules
    // ========================================================================

    async fetchSchedules(useCache = false): Promise<FaaSSchedule[]> {
      if (useCache && this.schedules.length > 0) return this.schedules

      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.schedules = true
      try {
        const url = FAAS_ROUTES.SCHEDULES(accountId)
        const { data } = await ApiService.get<{ data: FaaSSchedule[] }>(url, ACTION_KEYS_AC.FAAS_SCHEDULES_GET)
        this.schedules = data?.data || data || []
        this.lastFetched.schedules = Date.now()
        return this.schedules
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.schedules = false
      }
    },

    // ========================================================================
    // Proxy Settings
    // ========================================================================

    async fetchProxySettings(useCache = false): Promise<FaaSProxySetting[]> {
      if (useCache && this.proxySettings.length > 0) return this.proxySettings

      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.proxySettings = true
      try {
        const url = `${FAAS_ROUTES.PROXY_SETTINGS(accountId)}?includeDefault=true`
        const { data } = await ApiService.get<{ data: FaaSProxySetting[] }>(url, ACTION_KEYS_AC.FAAS_PROXY_SETTINGS_GET)
        this.proxySettings = data?.data || data || []
        this.lastFetched.proxySettings = Date.now()
        return this.proxySettings
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.proxySettings = false
      }
    },

    // ========================================================================
    // Fetch All
    // ========================================================================

    async fetchAll(): Promise<void> {
      this.loading.all = true
      try {
        await Promise.all([
          this.fetchLambdas(),
          this.fetchSchedules(),
          this.fetchProxySettings(),
        ])
      } finally {
        this.loading.all = false
      }
    },

    // ========================================================================
    // Snapshot Methods
    // ========================================================================

    getSnapshot(): Record<string, unknown> {
      return {
        lambdas: this.lambdas,
        schedules: this.schedules,
        proxySettings: this.proxySettings,
      }
    },

    loadSnapshot(snapshot: Record<string, unknown>): void {
      if (snapshot.lambdas) this.lambdas = snapshot.lambdas as Lambda[]
      if (snapshot.schedules) this.schedules = snapshot.schedules as FaaSSchedule[]
      if (snapshot.proxySettings) this.proxySettings = snapshot.proxySettings as FaaSProxySetting[]
    },

    reset(): void {
      this.lambdas = []
      this.schedules = []
      this.proxySettings = []
      this.lastFetched = {
        lambdas: null,
        schedules: null,
        proxySettings: null,
      }
    },
  },
})
