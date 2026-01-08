/**
 * User Guide Store
 */

import { defineStore } from "pinia";
import ApiService from "src/services/ApiService";
import {
  USER_GUIDE_ROUTES,
  USER_GUIDE_ACTION_KEYS,
} from "src/constants/constants.user-guide";

// ============ Image Upload Types ============

export interface UploadImageDto {
  base64: string;
  filename: string;
  routeName?: string;
}

export interface UploadImageResponse {
  url: string;
  filename: string;
}

// ============ Types ============

export interface GuideSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface UserGuide {
  id: string;
  routeName: string;
  title: string;
  description: string;
  sections: GuideSection[];
  keywords: string[];
  lastUpdated: number;
  lastUpdatedBy?: string;
  version: number;
}

export interface SearchResult {
  guideId: string;
  routeName: string;
  title: string;
  sectionId?: string;
  sectionTitle?: string;
  snippet: string;
  score: number;
  type: "guide" | "section";
}

export interface CreateGuideDto {
  routeName: string;
  title: string;
  description?: string;
  sections?: Omit<GuideSection, "id">[];
  keywords?: string[];
}

export interface UpdateGuideDto {
  title?: string;
  description?: string;
  sections?: GuideSection[];
  keywords?: string[];
}

export interface AddSectionDto {
  title: string;
  content: string;
  order?: number;
}

export interface UpdateSectionDto {
  title?: string;
  content?: string;
  order?: number;
}

// ============ Store ============

interface UserGuideState {
  guides: UserGuide[];
  currentGuide: UserGuide | null;
  searchResults: SearchResult[];
  loading: boolean;
  error: string | null;
  helpDrawerOpen: boolean;
  searchDialogOpen: boolean;
}

export const useUserGuideStore = defineStore("user-guide", {
  state: (): UserGuideState => ({
    guides: [],
    currentGuide: null,
    searchResults: [],
    loading: false,
    error: null,
    helpDrawerOpen: false,
    searchDialogOpen: false,
  }),

  getters: {
    getGuideByRouteName: (state) => (routeName: string) =>
      state.guides.find((g) => g.routeName === routeName),

    getSortedSections: (state) =>
      state.currentGuide?.sections.slice().sort((a, b) => a.order - b.order) ||
      [],
  },

  actions: {
    // ============ UI State ============

    openHelpDrawer() {
      this.helpDrawerOpen = true;
    },

    closeHelpDrawer() {
      this.helpDrawerOpen = false;
    },

    toggleHelpDrawer() {
      this.helpDrawerOpen = !this.helpDrawerOpen;
    },

    openSearchDialog() {
      this.searchDialogOpen = true;
    },

    closeSearchDialog() {
      this.searchDialogOpen = false;
    },

    toggleSearchDialog() {
      this.searchDialogOpen = !this.searchDialogOpen;
    },

    // ============ Guide CRUD ============

    async listGuides(): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        const response = await ApiService.get<{
          guides: UserGuide[];
          total: number;
        }>(USER_GUIDE_ROUTES.BASE, USER_GUIDE_ACTION_KEYS.LIST_GUIDES);
        this.guides = response.data.guides;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to list guides";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getGuide(id: string): Promise<UserGuide> {
      this.loading = true;
      this.error = null;

      try {
        const response = await ApiService.get<UserGuide>(
          USER_GUIDE_ROUTES.GUIDE(id),
          USER_GUIDE_ACTION_KEYS.GET_GUIDE
        );
        this.currentGuide = response.data;
        return response.data;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to get guide";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getGuideByRoute(routeName: string): Promise<UserGuide | null> {
      this.loading = true;
      this.error = null;

      try {
        const response = await ApiService.get<UserGuide | null>(
          USER_GUIDE_ROUTES.BY_ROUTE(routeName),
          USER_GUIDE_ACTION_KEYS.GET_GUIDE_BY_ROUTE
        );
        this.currentGuide = response.data;
        return response.data;
      } catch {
        // Guide might not exist, which is OK
        this.currentGuide = null;
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createGuide(dto: CreateGuideDto): Promise<UserGuide> {
      this.loading = true;
      this.error = null;

      try {
        const response = await ApiService.post<UserGuide>(
          USER_GUIDE_ROUTES.BASE,
          dto,
          USER_GUIDE_ACTION_KEYS.CREATE_GUIDE
        );
        this.guides.push(response.data);
        return response.data;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to create guide";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateGuide(id: string, dto: UpdateGuideDto): Promise<UserGuide> {
      this.loading = true;
      this.error = null;

      try {
        const response = await ApiService.put<UserGuide>(
          USER_GUIDE_ROUTES.GUIDE(id),
          dto,
          USER_GUIDE_ACTION_KEYS.UPDATE_GUIDE
        );
        const idx = this.guides.findIndex((g) => g.id === id);
        if (idx !== -1) {
          this.guides[idx] = response.data;
        }
        if (this.currentGuide?.id === id) {
          this.currentGuide = response.data;
        }
        return response.data;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to update guide";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteGuide(id: string): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        await ApiService.delete(
          USER_GUIDE_ROUTES.GUIDE(id),
          USER_GUIDE_ACTION_KEYS.DELETE_GUIDE
        );
        this.guides = this.guides.filter((g) => g.id !== id);
        if (this.currentGuide?.id === id) {
          this.currentGuide = null;
        }
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to delete guide";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // ============ Search ============

    async searchGuides(query: string, limit = 20): Promise<SearchResult[]> {
      this.loading = true;
      this.error = null;

      try {
        const response = await ApiService.get<{
          results: SearchResult[];
          total: number;
        }>(USER_GUIDE_ROUTES.SEARCH, USER_GUIDE_ACTION_KEYS.SEARCH_GUIDES, {
          q: query, limit
        });
        this.searchResults = response.data.results;
        return response.data.results;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to search guides";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearSearchResults() {
      this.searchResults = [];
    },

    // ============ Section Operations ============

    async addSection(guideId: string, dto: AddSectionDto): Promise<UserGuide> {
      this.loading = true;
      this.error = null;

      try {
        const response = await ApiService.post<UserGuide>(
          USER_GUIDE_ROUTES.SECTIONS(guideId),
          dto,
          USER_GUIDE_ACTION_KEYS.ADD_SECTION
        );
        const idx = this.guides.findIndex((g) => g.id === guideId);
        if (idx !== -1) {
          this.guides[idx] = response.data;
        }
        if (this.currentGuide?.id === guideId) {
          this.currentGuide = response.data;
        }
        return response.data;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to add section";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateSection(
      guideId: string,
      sectionId: string,
      dto: UpdateSectionDto
    ): Promise<UserGuide> {
      this.loading = true;
      this.error = null;

      try {
        const response = await ApiService.put<UserGuide>(
          USER_GUIDE_ROUTES.SECTION(guideId, sectionId),
          dto,
          USER_GUIDE_ACTION_KEYS.UPDATE_SECTION
        );
        const idx = this.guides.findIndex((g) => g.id === guideId);
        if (idx !== -1) {
          this.guides[idx] = response.data;
        }
        if (this.currentGuide?.id === guideId) {
          this.currentGuide = response.data;
        }
        return response.data;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to update section";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteSection(guideId: string, sectionId: string): Promise<UserGuide> {
      this.loading = true;
      this.error = null;

      try {
        const response = await ApiService.delete<UserGuide>(
          USER_GUIDE_ROUTES.SECTION(guideId, sectionId),
          USER_GUIDE_ACTION_KEYS.DELETE_SECTION
        );
        const idx = this.guides.findIndex((g) => g.id === guideId);
        if (idx !== -1) {
          this.guides[idx] = response.data;
        }
        if (this.currentGuide?.id === guideId) {
          this.currentGuide = response.data;
        }
        return response.data;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to delete section";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async reorderSections(
      guideId: string,
      sectionIds: string[]
    ): Promise<UserGuide> {
      this.loading = true;
      this.error = null;

      try {
        const response = await ApiService.put<UserGuide>(
          USER_GUIDE_ROUTES.REORDER_SECTIONS(guideId),
          sectionIds,
          USER_GUIDE_ACTION_KEYS.REORDER_SECTIONS
        );
        const idx = this.guides.findIndex((g) => g.id === guideId);
        if (idx !== -1) {
          this.guides[idx] = response.data;
        }
        if (this.currentGuide?.id === guideId) {
          this.currentGuide = response.data;
        }
        return response.data;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to reorder sections";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    // ============ Image Upload ============

    async uploadImage(dto: UploadImageDto): Promise<UploadImageResponse> {
      try {
        const response = await ApiService.post<UploadImageResponse>(
          USER_GUIDE_ROUTES.UPLOAD_IMAGE,
          dto,
          USER_GUIDE_ACTION_KEYS.UPLOAD_IMAGE
        );
        return response.data;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to upload image";
        throw error;
      }
    },
  },
});
