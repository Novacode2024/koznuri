import api from "./api";

// Work Time Types
export interface WorkTime {
  uuid: string;
  start_time: string;
  end_time: string;
  branch: string | null;
  title_uz: string;
  title_kr: string;
  title_ru: string;
  title_en: string;
  title_tj: string;
  title_kz: string;
  title_kg: string;
}

// Work Times API Service
export const workTimesService = {
  // Get all work times
  // Note: This is an optional endpoint - silently returns empty array if 404
  getWorkTimes: async (): Promise<WorkTime[]> => {
    try {
      const response = await api.get<WorkTime[]>("/company-work-times/");
      // Ensure response is an array
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    } catch (error: unknown) {
      // Silently return empty array if endpoint doesn't exist (404) or fails
      // This is an optional feature, so we don't show errors to users
      const apiError = error as { status?: number };
      if (apiError.status === 404) {
        // Endpoint doesn't exist - this is OK, return empty array
        return [];
      }
      // For other errors, still return empty array
      return [];
    }
  },
};

