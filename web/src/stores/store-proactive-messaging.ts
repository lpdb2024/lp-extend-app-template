/**
 * Proactive Messaging Store
 * Pinia store for LivePerson Proactive Messaging data
 * Manages Proactive Campaigns and Handoff Configurations
 */

import { defineStore } from 'pinia'
import { useUserStore } from './store-user'
import ApiService from 'src/services/ApiService'
import ErrorService from 'src/services/ErrorService'
import { LP_PROACTIVE_MESSAGING_ROUTES, LP_V2_ACTION_KEYS } from 'src/constants'

const handleRequestError = ErrorService.handleRequestError.bind(ErrorService)

// ============================================================================
// Enums
// ============================================================================

export enum PMCampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PMChannelType {
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  INAPP = 'inapp',
  APPLE_BUSINESS_CHAT = 'abc',
  GOOGLE_BUSINESS_MESSAGES = 'gbm',
}

export enum PMHandoffType {
  CONVERSATION_CLOUD = 'conversationCloud',
  EXTERNAL = 'external',
}

// ============================================================================
// Interfaces
// ============================================================================

export interface PMConsumerIdentifier {
  type: 'phone' | 'email' | 'consumerId'
  value: string
}

export interface PMCampaignChannel {
  type: PMChannelType
  enabled: boolean
  templateId?: string
  handoffId?: string
  message?: string
  metadata?: Record<string, unknown>
}

export interface PMCampaignSchedule {
  startTime?: number
  endTime?: number
  timezone?: string
  sendImmediately?: boolean
}

export interface PMCampaignTargeting {
  consumers: PMConsumerIdentifier[]
  segmentId?: string
  maxRecipients?: number
}

export interface PMCampaignThrottling {
  enabled: boolean
  maxMessagesPerHour?: number
  maxMessagesPerDay?: number
}

export interface PMCampaignStats {
  totalTargeted: number
  totalSent: number
  totalDelivered: number
  totalFailed: number
  totalOpened: number
  totalClicked: number
  totalReplied: number
}

export interface PMCampaign {
  id: string
  accountId: string
  name: string
  description?: string
  status: PMCampaignStatus
  channels: PMCampaignChannel[]
  targeting: PMCampaignTargeting
  schedule?: PMCampaignSchedule
  throttling?: PMCampaignThrottling
  skillId?: string
  metadata?: Record<string, unknown>
  createdAt: number
  updatedAt: number
  createdBy?: string
  stats?: PMCampaignStats
}

export interface PMHandoff {
  id: string
  accountId: string
  name: string
  description?: string
  type: PMHandoffType
  skillId?: string
  conversationAttributes?: Record<string, unknown>
  createdAt: number
  updatedAt: number
  enabled: boolean
}

// ============================================================================
// State Interface
// ============================================================================

interface ProactiveMessagingState {
  campaigns: PMCampaign[]
  handoffs: PMHandoff[]
  loading: {
    campaigns: boolean
    handoffs: boolean
    all: boolean
  }
  lastFetched: {
    campaigns: number | null
    handoffs: number | null
  }
}

// ============================================================================
// Store Definition
// ============================================================================

export const useProactiveMessagingStore = defineStore('proactiveMessaging', {
  state: (): ProactiveMessagingState => ({
    campaigns: [],
    handoffs: [],
    loading: {
      campaigns: false,
      handoffs: false,
      all: false,
    },
    lastFetched: {
      campaigns: null,
      handoffs: null,
    },
  }),

  getters: {
    accountId(): string | null {
      const userStore = useUserStore()
      return userStore.accountId || null
    },

    hasData(): boolean {
      return this.campaigns.length > 0 || this.handoffs.length > 0
    },

    // Campaign status getters
    activeCampaigns(): PMCampaign[] {
      return this.campaigns.filter(c => c.status === PMCampaignStatus.ACTIVE)
    },

    scheduledCampaigns(): PMCampaign[] {
      return this.campaigns.filter(c => c.status === PMCampaignStatus.SCHEDULED)
    },

    draftCampaigns(): PMCampaign[] {
      return this.campaigns.filter(c => c.status === PMCampaignStatus.DRAFT)
    },

    pausedCampaigns(): PMCampaign[] {
      return this.campaigns.filter(c => c.status === PMCampaignStatus.PAUSED)
    },

    completedCampaigns(): PMCampaign[] {
      return this.campaigns.filter(c => c.status === PMCampaignStatus.COMPLETED)
    },

    cancelledCampaigns(): PMCampaign[] {
      return this.campaigns.filter(c => c.status === PMCampaignStatus.CANCELLED)
    },

    // Handoff getters
    enabledHandoffs(): PMHandoff[] {
      return this.handoffs.filter(h => h.enabled)
    },

    disabledHandoffs(): PMHandoff[] {
      return this.handoffs.filter(h => !h.enabled)
    },

    // Entity counts
    entityCounts(): { campaigns: number; handoffs: number } {
      return {
        campaigns: this.campaigns.length,
        handoffs: this.handoffs.length,
      }
    },

    // Campaign stats aggregation
    totalCampaignStats(): PMCampaignStats {
      return this.campaigns.reduce(
        (acc, campaign) => {
          if (campaign.stats) {
            acc.totalTargeted += campaign.stats.totalTargeted || 0
            acc.totalSent += campaign.stats.totalSent || 0
            acc.totalDelivered += campaign.stats.totalDelivered || 0
            acc.totalFailed += campaign.stats.totalFailed || 0
            acc.totalOpened += campaign.stats.totalOpened || 0
            acc.totalClicked += campaign.stats.totalClicked || 0
            acc.totalReplied += campaign.stats.totalReplied || 0
          }
          return acc
        },
        {
          totalTargeted: 0,
          totalSent: 0,
          totalDelivered: 0,
          totalFailed: 0,
          totalOpened: 0,
          totalClicked: 0,
          totalReplied: 0,
        }
      )
    },
  },

  actions: {
    // ========================================================================
    // Campaigns
    // ========================================================================

    async fetchCampaigns(useCache = false): Promise<PMCampaign[]> {
      if (useCache && this.campaigns.length > 0) return this.campaigns

      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.campaigns = true
      try {
        const url = LP_PROACTIVE_MESSAGING_ROUTES.CAMPAIGNS(accountId)
        const { data } = await ApiService.get<{ campaigns: PMCampaign[]; total: number }>(
          url,
          LP_V2_ACTION_KEYS.PROACTIVE_CAMPAIGNS_GET
        )
        this.campaigns = data?.campaigns || []
        this.lastFetched.campaigns = Date.now()
        return this.campaigns
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.campaigns = false
      }
    },

    // ========================================================================
    // Handoffs
    // ========================================================================

    async fetchHandoffs(useCache = false): Promise<PMHandoff[]> {
      if (useCache && this.handoffs.length > 0) return this.handoffs

      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.handoffs = true
      try {
        const url = LP_PROACTIVE_MESSAGING_ROUTES.HANDOFFS(accountId)
        const { data } = await ApiService.get<{ handoffs: PMHandoff[]; total: number }>(
          url,
          LP_V2_ACTION_KEYS.PROACTIVE_HANDOFFS_GET
        )
        this.handoffs = data?.handoffs || []
        this.lastFetched.handoffs = Date.now()
        return this.handoffs
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.handoffs = false
      }
    },

    // ========================================================================
    // Fetch All
    // ========================================================================

    async fetchAll(): Promise<void> {
      this.loading.all = true
      try {
        await Promise.all([
          this.fetchCampaigns(),
          this.fetchHandoffs(),
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
        campaigns: this.campaigns,
        handoffs: this.handoffs,
      }
    },

    loadSnapshot(snapshot: Record<string, unknown>): void {
      if (snapshot.campaigns) this.campaigns = snapshot.campaigns as PMCampaign[]
      if (snapshot.handoffs) this.handoffs = snapshot.handoffs as PMHandoff[]
    },

    reset(): void {
      this.campaigns = []
      this.handoffs = []
      this.lastFetched = {
        campaigns: null,
        handoffs: null,
      }
    },
  },
})
