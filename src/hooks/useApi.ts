import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import type { ApiError } from "../services/api";

// Generic API hook return type
export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

// Generic API hook
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: unknown[] = []
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useApp();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      const apiError = err as ApiError;
      // Don't show notifications for 404 errors (optional endpoints)
      // Service should handle 404 gracefully and return empty data
      if (apiError.status === 404) {
        // Silently handle 404 - service should have returned empty data
        setData(null);
        setError(null);
        return;
      }
      const errorMessage =
        apiError.message || "An error occurred while fetching data";
      setError(errorMessage);
      addNotification({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, dependencies);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate,
  };
}

// Hook for API calls with immediate execution
export function useApiCall<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useApp();

  const execute = useCallback(
    async (apiCall: () => Promise<T>): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        return result;
      } catch (err) {
        const apiError = err as ApiError;
        const errorMessage = apiError.message || "An error occurred";
        setError(errorMessage);
        addNotification({
          type: "error",
          title: "Error",
          message: errorMessage,
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [addNotification]
  );

  return {
    loading,
    error,
    execute,
  };
}

// Hook for paginated data
export interface UsePaginatedApiReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  refetch: () => Promise<void>;
}

export function usePaginatedApi<T>(
  apiCall: (
    page: number,
    limit: number
  ) => Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>,
  limit: number = 10,
  initialPage: number = 1
): UsePaginatedApiReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const { addNotification } = useApp();

  const fetchData = useCallback(
    async (currentPage: number) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall(currentPage, limit);
        setData(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(result.page);
      } catch (err) {
        const apiError = err as ApiError;
        const errorMessage =
          apiError.message || "An error occurred while fetching data";
        setError(errorMessage);
        addNotification({
          type: "error",
          title: "Error",
          message: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    },
    [apiCall, limit, addNotification]
  );

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      fetchData(page + 1);
    }
  }, [page, totalPages, fetchData]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      fetchData(page - 1);
    }
  }, [page, fetchData]);

  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        fetchData(newPage);
      }
    },
    [totalPages, fetchData]
  );

  const refetch = useCallback(() => {
    return fetchData(page);
  }, [fetchData, page]);

  useEffect(() => {
    fetchData(initialPage);
  }, [fetchData, initialPage]);

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    total,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage,
    prevPage,
    goToPage,
    refetch,
  };
}
