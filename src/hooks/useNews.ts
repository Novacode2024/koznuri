import { useApi, usePaginatedApi, useApiCall } from "./useApi";
import {
  newsService,
  News,
  NewsFilters,
} from "../services/newsService";

// Hook for getting all news with pagination
export function useNews(filters: NewsFilters = {}) {
  return usePaginatedApi<News>(
    async (page, limit) => {
      const response = await newsService.getNews({ ...filters, page, limit });
      return {
        data: response.news,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      };
    },
    filters.limit || 10,
    filters.page || 1
  );
}

// Hook for getting single news by ID
export function useNewsById(id: string) {
  return useApi<News>(() => newsService.getNewsById(id), [id]);
}

// Hook for getting single news by slug
export function useNewsBySlug(slug: string) {
  return useApi<News>(() => newsService.getNewsBySlug(slug), [slug]);
}

// Hook for getting featured news
export function useFeaturedNews(limit: number = 5) {
  return useApi<News[]>(() => newsService.getFeaturedNews(limit), [limit]);
}

// Hook for getting news by category
export function useNewsByCategory(category: string, limit: number = 10) {
  return useApi<News[]>(
    () => newsService.getNewsByCategory(category, limit),
    [category, limit]
  );
}

// Hook for searching news
export function useSearchNews(query: string, limit: number = 10) {
  return useApi<News[]>(
    () => newsService.searchNews(query, limit),
    [query, limit]
  );
}

// Hook for getting related news
export function useRelatedNews(newsId: string, limit: number = 4) {
  return useApi<News[]>(
    () => newsService.getRelatedNews(newsId, limit),
    [newsId, limit]
  );
}

// Hook for news actions (like, unlike, increment views)
export function useNewsActions() {
  const { execute } = useApiCall();

  const incrementViews = async (id: string) => {
    return await execute(() => newsService.incrementViews(id));
  };

  const likeNews = async (id: string) => {
    return await execute(() => newsService.likeNews(id));
  };

  const unlikeNews = async (id: string) => {
    return await execute(() => newsService.unlikeNews(id));
  };

  return {
    incrementViews,
    likeNews,
    unlikeNews,
  };
}
