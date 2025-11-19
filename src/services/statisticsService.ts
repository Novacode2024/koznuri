import api from "./api";

// Statistics Types
export interface StatisticItem {
  uuid: string;
  title_uz: string;
  title_kr: string;
  title_ru: string;
  title_en: string;
  title_tj: string;
  title_kz: string;
  title_kg: string;
  subtitle_uz: string;
  subtitle_kr: string;
  subtitle_ru: string;
  subtitle_en: string;
  subtitle_tj: string;
  subtitle_kz: string;
  subtitle_kg: string;
  value: string;
  order: number;
}

// Statistics API Service
export const statisticsService = {
  // Get all statistics
  getStatistics: async (): Promise<StatisticItem[]> => {
    return api.get<StatisticItem[]>("/statistics/");
  },
};
