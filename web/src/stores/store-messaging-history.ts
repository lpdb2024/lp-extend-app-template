/**
 * Messaging History Store
 * Pinia store for LivePerson Messaging Interactions (History) API
 * Uses the msgHist service domain
 */

import { defineStore } from 'pinia';
import ApiService from 'src/services/ApiService';
import ErrorService from 'src/services/ErrorService';
import { LP_MESSAGING_HISTORY_ROUTES, LP_V2_ACTION_KEYS } from 'src/constants';
import type {
  ConversationHistoryRecords,
  ConversationHistoryResponse,
} from 'src/interfaces';
import { useUserStore } from './store-user';

const handleRequestError = ErrorService.handleRequestError.bind(ErrorService);

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Time range for conversation search
 */
export interface TimeRange {
  from: number;
  to: number;
}

/**
 * Numeric range filter
 */
export interface NumericRange {
  from?: number;
  to?: number;
}

/**
 * Conversation status types
 */
export type ConversationStatus = 'OPEN' | 'CLOSE' | 'OVERDUE';

/**
 * Content types that can be retrieved
 */
export type ContentToRetrieve =
  | 'campaign'
  | 'messageRecords'
  | 'agentParticipants'
  | 'agentParticipantsLeave'
  | 'agentParticipantsActive'
  | 'consumerParticipants'
  | 'transfers'
  | 'interactions'
  | 'messageScores'
  | 'messageStatuses'
  | 'conversationSurveys'
  | 'coBrowseSessions'
  | 'summary'
  | 'sdes'
  | 'unAuthSdes'
  | 'monitoring'
  | 'dialogs'
  | 'responseTime'
  | 'skillChanges'
  | 'intents'
  | 'uniqueIntents'
  | 'latestAgentSurvey'
  | 'previouslySubmittedAgentSurveys';

/**
 * Conversation search request body
 */
export interface ConversationSearchRequest {
  start: TimeRange;
  end?: TimeRange;
  status?: ConversationStatus[];
  skillIds?: number[];
  latestSkillIds?: number[];
  agentIds?: string[];
  latestAgentIds?: string[];
  agentGroupIds?: number[];
  keyword?: string;
  summary?: string;
  duration?: NumericRange;
  csat?: NumericRange;
  mcs?: NumericRange;
  alertedMcsValues?: number[];
  source?: string[];
  device?: string[];
  contentToRetrieve?: ContentToRetrieve[];
  latestUpdateTime?: number;
  nps?: NumericRange;
  responseTime?: NumericRange;
}

/**
 * Query parameters for conversation search
 */
export interface ConversationSearchQuery {
  offset?: number;
  limit?: number;
  sort?: string;
}

/**
 * Options for paginated search
 */
export interface PaginatedSearchOptions {
  /** If true, only fetch first page and return total count (for preview) */
  firstOnly?: boolean;
  /** Maximum total records to fetch across all pages (default: no limit) */
  maxRecords?: number;
  /** Progress callback called after each page fetch */
  onProgress?: (fetched: number, total: number) => void;
}

/**
 * Result from paginated search
 */
export interface PaginatedSearchResult {
  records: ConversationHistoryRecords[];
  totalCount: number;
  fetchedCount: number;
  /** True if more records exist beyond what was fetched */
  hasMore: boolean;
}

/** Maximum records per API request (LP API limit) */
const MAX_PER_REQUEST = 100;

/**
 * Get conversation by ID request
 */
export interface GetConversationByIdRequest {
  conversationId?: string;
  conversationIds?: string[];
  contentToRetrieve?: ContentToRetrieve[];
}

/**
 * Get conversations by consumer request
 */
export interface GetConversationsByConsumerRequest {
  consumer: string;
  status: ConversationStatus[];
  contentToRetrieve?: ContentToRetrieve[];
}

// ============================================================================
// State Interface
// ============================================================================

interface MessagingHistoryState {
  conversations: ConversationHistoryRecords[];
  currentConversation: ConversationHistoryRecords | null;
  loading: {
    search: boolean;
    getById: boolean;
    transcript: boolean;
  };
  lastSearch: {
    timestamp: number | null;
    count: number;
    metadata: {
      count?: number;
      partialResult?: boolean;
    } | null;
  };
}

// ============================================================================
// Store Definition
// ============================================================================

export const useMessagingHistoryStore = defineStore('messagingHistory', {
  state: (): MessagingHistoryState => ({
    conversations: [],
    currentConversation: null,
    loading: {
      search: false,
      getById: false,
      transcript: false,
    },
    lastSearch: {
      timestamp: null,
      count: 0,
      metadata: null,
    },
  }),

  getters: {
    accountId(): string | null {
      return useUserStore().accountId || sessionStorage.getItem('accountId')
    },

    hasConversations(): boolean {
      return this.conversations.length > 0;
    },

    isLoading(): boolean {
      return this.loading.search || this.loading.getById || this.loading.transcript;
    },

    openConversations(): ConversationHistoryRecords[] {
      return this.conversations.filter(c => c.info?.status === 'OPEN');
    },

    closedConversations(): ConversationHistoryRecords[] {
      return this.conversations.filter(c => c.info?.status === 'CLOSE');
    },
  },

  actions: {
    // ========================================================================
    // Search Conversations
    // ========================================================================

    /**
     * Execute a single search request (internal method)
     * Handles one page of results with max 100 records
     */
    async _searchPage(
      accountId: string,
      body: ConversationSearchRequest,
      offset: number,
      limit: number,
      sort?: string
    ): Promise<{ records: ConversationHistoryRecords[]; totalCount: number }> {
      const baseUrl = LP_MESSAGING_HISTORY_ROUTES.SEARCH(accountId);
      const params = new URLSearchParams();
      params.append('offset', String(offset));
      params.append('limit', String(Math.min(limit, MAX_PER_REQUEST)));
      if (sort) params.append('sort', sort);

      const url = `${baseUrl}?${params.toString()}`;

      const response = await ApiService.post<ConversationHistoryResponse>(
        url,
        body,
        LP_V2_ACTION_KEYS.CONVERSATIONS_SEARCH
      );

      // ApiService returns axios response with data property
      const data = response.data;

      // Extract count and records with proper fallbacks
      const count = data?._metadata?.count ?? 0;
      const records = data?.conversationHistoryRecords ?? [];

      console.debug('[MessagingHistoryStore] Search response:', {
        hasMetadata: !!data?._metadata,
        count,
        recordsLength: records.length,
      });

      return {
        records,
        totalCount: count,
      };
    },

    /**
     * Search conversations with filters and automatic pagination
     * @param body - Search filters
     * @param options - Pagination options
     * @param storeResults - Whether to store results in the store state
     * @returns Paginated search result with records and counts
     */
    async searchConversations(
      body: ConversationSearchRequest,
      options?: PaginatedSearchOptions & { sort?: string },
      storeResults = true
    ): Promise<PaginatedSearchResult> {
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error('No accountId found');
      }

      this.loading.search = true;
      try {
        // First request to get total count and first page
        const firstPage = await this._searchPage(accountId, body, 0, MAX_PER_REQUEST, options?.sort);
        const totalCount = firstPage.totalCount;
        let allRecords = [...firstPage.records];

        // If firstOnly, return immediately with total count
        if (options?.firstOnly) {
          if (storeResults) {
            this.conversations = allRecords;
            this.lastSearch = {
              timestamp: Date.now(),
              count: totalCount,
              metadata: { count: totalCount },
            };
          }
          return {
            records: allRecords,
            totalCount,
            fetchedCount: allRecords.length,
            hasMore: totalCount > allRecords.length,
          };
        }

        // Calculate how many records to fetch
        const maxToFetch = options?.maxRecords ?? totalCount;
        const targetCount = Math.min(maxToFetch, totalCount);

        // Report initial progress
        options?.onProgress?.(allRecords.length, targetCount);

        // Fetch remaining pages if needed
        while (allRecords.length < targetCount) {
          const nextPage = await this._searchPage(
            accountId,
            body,
            allRecords.length,
            MAX_PER_REQUEST,
            options?.sort
          );

          if (nextPage.records.length === 0) {
            // No more records available
            break;
          }

          allRecords = [...allRecords, ...nextPage.records];

          // Report progress
          options?.onProgress?.(allRecords.length, targetCount);

          // Trim to maxRecords if specified
          if (options?.maxRecords && allRecords.length >= options.maxRecords) {
            allRecords = allRecords.slice(0, options.maxRecords);
            break;
          }
        }

        if (storeResults) {
          this.conversations = allRecords;
          this.lastSearch = {
            timestamp: Date.now(),
            count: totalCount,
            metadata: { count: totalCount },
          };
        }

        return {
          records: allRecords,
          totalCount,
          fetchedCount: allRecords.length,
          hasMore: totalCount > allRecords.length,
        };
      } catch (error) {
        handleRequestError(error, true);
        throw error;
      } finally {
        this.loading.search = false;
      }
    },

    /**
     * Legacy method for simple single-page search
     * @deprecated Use searchConversations with options instead
     */
    async searchConversationsSimple(
      body: ConversationSearchRequest,
      query?: ConversationSearchQuery,
      storeResults = true
    ): Promise<{ records: ConversationHistoryRecords[]; count: number }> {
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error('No accountId found');
      }

      this.loading.search = true;
      try {
        const result = await this._searchPage(
          accountId,
          body,
          query?.offset || 0,
          query?.limit || MAX_PER_REQUEST,
          query?.sort
        );

        if (storeResults) {
          this.conversations = result.records;
          this.lastSearch = {
            timestamp: Date.now(),
            count: result.totalCount,
            metadata: { count: result.totalCount },
          };
        }

        return { records: result.records, count: result.totalCount };
      } catch (error) {
        handleRequestError(error, true);
        throw error;
      } finally {
        this.loading.search = false;
      }
    },

    // ========================================================================
    // Get Conversation by ID
    // ========================================================================

    /**
     * Get conversation(s) by ID(s)
     */
    async getConversationById(
      body: GetConversationByIdRequest
    ): Promise<ConversationHistoryRecords[]> {
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error('No accountId found');
      }

      this.loading.getById = true;
      try {
        const url = LP_MESSAGING_HISTORY_ROUTES.BY_ID(accountId);

        const { data } = await ApiService.post<ConversationHistoryResponse>(
          url,
          body,
          LP_V2_ACTION_KEYS.CONVERSATION_GET_BY_ID
        );

        return data.conversationHistoryRecords || [];
      } catch (error) {
        handleRequestError(error, true);
        throw error;
      } finally {
        this.loading.getById = false;
      }
    },

    /**
     * Get a single conversation by ID with full transcript
     */
    async getConversationWithTranscript(
      conversationId: string
    ): Promise<ConversationHistoryRecords | null> {
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error('No accountId found');
      }

      this.loading.transcript = true;
      try {
        const url = LP_MESSAGING_HISTORY_ROUTES.TRANSCRIPT(accountId, conversationId);

        const { data } = await ApiService.post<ConversationHistoryResponse>(
          url,
          {},
          LP_V2_ACTION_KEYS.CONVERSATION_TRANSCRIPT
        );

        const conversation = data.conversationHistoryRecords?.[0] || null;
        this.currentConversation = conversation;

        return conversation;
      } catch (error) {
        handleRequestError(error, true);
        throw error;
      } finally {
        this.loading.transcript = false;
      }
    },

    /**
     * Get multiple conversations with full transcripts in batches
     * Uses the by-id endpoint which supports up to 100 IDs per request
     * @param conversationIds - Array of conversation IDs to fetch
     * @param onProgress - Optional callback for progress updates
     * @returns Map of conversationId -> ConversationHistoryRecords
     */
    async getConversationsWithTranscripts(
      conversationIds: string[],
      onProgress?: (fetched: number, total: number) => void
    ): Promise<Map<string, ConversationHistoryRecords>> {
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error('No accountId found');
      }

      const result = new Map<string, ConversationHistoryRecords>();
      const BATCH_SIZE = 100; // LP API limit for by-id endpoint

      // Split into batches
      const batches: string[][] = [];
      for (let i = 0; i < conversationIds.length; i += BATCH_SIZE) {
        batches.push(conversationIds.slice(i, i + BATCH_SIZE));
      }

      let fetched = 0;
      for (const batch of batches) {
        try {
          const url = LP_MESSAGING_HISTORY_ROUTES.BY_ID(accountId);
          const { data } = await ApiService.post<ConversationHistoryResponse>(
            url,
            {
              conversationIds: batch,
              contentToRetrieve: [
                'messageRecords',
                'agentParticipants',
                'consumerParticipants',
                'transfers',
                'interactions',
                'summary',
              ],
            },
            LP_V2_ACTION_KEYS.CONVERSATION_GET_BY_ID
          );

          // Add conversations to result map
          for (const conv of data.conversationHistoryRecords || []) {
            if (conv.info?.conversationId) {
              result.set(conv.info.conversationId, conv);
            }
          }

          fetched += batch.length;
          onProgress?.(fetched, conversationIds.length);
        } catch (error) {
          console.error(`Failed to fetch batch of ${batch.length} conversations:`, error);
          // Continue with next batch even if one fails
        }
      }

      return result;
    },

    // ========================================================================
    // Get Conversations by Consumer
    // ========================================================================

    /**
     * Get all conversations for a specific consumer
     */
    async getConversationsByConsumer(
      body: GetConversationsByConsumerRequest,
      query?: { offset?: number; limit?: number }
    ): Promise<{ records: ConversationHistoryRecords[]; count: number }> {
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error('No accountId found');
      }

      this.loading.search = true;
      try {
        let url = LP_MESSAGING_HISTORY_ROUTES.BY_CONSUMER(accountId);

        // Add query params
        const params = new URLSearchParams();
        if (query?.offset !== undefined) params.append('offset', String(query.offset));
        if (query?.limit !== undefined) params.append('limit', String(query.limit));

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const { data } = await ApiService.post<ConversationHistoryResponse>(
          url,
          body,
          LP_V2_ACTION_KEYS.CONVERSATIONS_BY_CONSUMER
        );

        const records = data.conversationHistoryRecords || [];
        const count = data._metadata?.count || records.length;

        return { records, count };
      } catch (error) {
        handleRequestError(error, true);
        throw error;
      } finally {
        this.loading.search = false;
      }
    },

    // ========================================================================
    // Convenience Methods
    // ========================================================================

    /**
     * Get open conversations (convenience method)
     */
    async getOpenConversations(options?: {
      skillIds?: number[];
      agentIds?: string[];
      contentToRetrieve?: ContentToRetrieve[];
      limit?: number;
    }): Promise<{ records: ConversationHistoryRecords[]; count: number }> {
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error('No accountId found');
      }

      this.loading.search = true;
      try {
        let url = LP_MESSAGING_HISTORY_ROUTES.OPEN(accountId);
        if (options?.limit) {
          url += `?limit=${options.limit}`;
        }

        const { data } = await ApiService.post<ConversationHistoryResponse>(
          url,
          {
            skillIds: options?.skillIds,
            agentIds: options?.agentIds,
            contentToRetrieve: options?.contentToRetrieve,
          },
          LP_V2_ACTION_KEYS.CONVERSATIONS_OPEN
        );

        const records = data.conversationHistoryRecords || [];
        const count = data._metadata?.count || records.length;

        return { records, count };
      } catch (error) {
        handleRequestError(error, true);
        throw error;
      } finally {
        this.loading.search = false;
      }
    },

    /**
     * Get recently closed conversations (convenience method)
     */
    async getRecentClosedConversations(options?: {
      daysBack?: number;
      skillIds?: number[];
      agentIds?: string[];
      contentToRetrieve?: ContentToRetrieve[];
      limit?: number;
    }): Promise<{ records: ConversationHistoryRecords[]; count: number }> {
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error('No accountId found');
      }

      this.loading.search = true;
      try {
        let url = LP_MESSAGING_HISTORY_ROUTES.RECENT_CLOSED(accountId);

        const params = new URLSearchParams();
        if (options?.daysBack) params.append('daysBack', String(options.daysBack));
        if (options?.limit) params.append('limit', String(options.limit));

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const { data } = await ApiService.post<ConversationHistoryResponse>(
          url,
          {
            skillIds: options?.skillIds,
            agentIds: options?.agentIds,
            contentToRetrieve: options?.contentToRetrieve,
          },
          LP_V2_ACTION_KEYS.CONVERSATIONS_RECENT_CLOSED
        );

        const records = data.conversationHistoryRecords || [];
        const count = data._metadata?.count || records.length;

        return { records, count };
      } catch (error) {
        handleRequestError(error, true);
        throw error;
      } finally {
        this.loading.search = false;
      }
    },

    /**
     * Search conversations by keyword
     */
    async searchByKeyword(
      keyword: string,
      options?: {
        startTime?: number;
        endTime?: number;
        status?: ConversationStatus[];
        limit?: number;
      }
    ): Promise<{ records: ConversationHistoryRecords[]; count: number }> {
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error('No accountId found');
      }

      this.loading.search = true;
      try {
        const url = LP_MESSAGING_HISTORY_ROUTES.SEARCH_KEYWORD(accountId);

        const { data } = await ApiService.post<ConversationHistoryResponse>(
          url,
          {
            keyword,
            startTime: options?.startTime,
            endTime: options?.endTime,
            status: options?.status,
            limit: options?.limit,
          },
          LP_V2_ACTION_KEYS.CONVERSATIONS_SEARCH_KEYWORD
        );

        const records = data.conversationHistoryRecords || [];
        const count = data._metadata?.count || records.length;

        return { records, count };
      } catch (error) {
        handleRequestError(error, true);
        throw error;
      } finally {
        this.loading.search = false;
      }
    },

    // ========================================================================
    // State Management
    // ========================================================================

    /**
     * Clear current conversation
     */
    clearCurrentConversation(): void {
      this.currentConversation = null;
    },

    /**
     * Clear all conversations
     */
    clearConversations(): void {
      this.conversations = [];
      this.lastSearch = {
        timestamp: null,
        count: 0,
        metadata: null,
      };
    },

    /**
     * Reset entire store state
     */
    reset(): void {
      this.conversations = [];
      this.currentConversation = null;
      this.loading = {
        search: false,
        getById: false,
        transcript: false,
      };
      this.lastSearch = {
        timestamp: null,
        count: 0,
        metadata: null,
      };
    },
  },
});
