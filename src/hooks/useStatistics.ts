import { useApi } from "./useApi";
import {
  statisticsService,
  StatisticItem,
} from "../services/statisticsService";

// Hook for getting statistics
export function useStatistics() {
  return useApi<StatisticItem[]>(() => statisticsService.getStatistics(), []);
}
