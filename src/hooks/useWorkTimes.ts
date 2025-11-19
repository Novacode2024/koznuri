import { useApi } from "./useApi";
import {
  workTimesService,
  WorkTime,
} from "../services/workTimesService";

// Flag to enable/disable work-times endpoint
// Set to false if endpoint is not available to prevent 404 errors
const ENABLE_WORK_TIMES = false;

// Hook for getting work times
// Service handles 404 errors gracefully by returning empty array
export function useWorkTimes() {
  // If disabled, return empty data without making API call
  const result = useApi<WorkTime[]>(
    () => {
      if (!ENABLE_WORK_TIMES) {
        return Promise.resolve([]);
      }
      return workTimesService.getWorkTimes();
    },
    [] // Empty dependency array since ENABLE_WORK_TIMES is a constant
  );
  
  // Ensure data is always an array (service already handles errors)
  return {
    ...result,
    data: result.data ?? [],
    loading: ENABLE_WORK_TIMES ? result.loading : false,
  };
}

