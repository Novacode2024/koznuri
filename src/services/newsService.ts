import api from "./api";

// News Types
export interface News {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  isPublished: boolean;
  slug: string;
}

export interface NewsListResponse {
  news: News[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NewsFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  published?: boolean;
  sortBy?: "publishedAt" | "views" | "likes" | "title";
  sortOrder?: "asc" | "desc";
}

// News API Service
export const newsService = {
  // Get all news with filters
  getNews: async (filters: NewsFilters = {}): Promise<NewsListResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.category) params.append("category", filters.category);
    if (filters.search) params.append("search", filters.search);
    if (filters.published !== undefined)
      params.append("published", filters.published.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `/news?${queryString}` : "/news";

    const response = await api.get<NewsListResponse>(url);
    return response;
  },

  // Get single news by ID
  getNewsById: async (id: string): Promise<News> => {
    const response = await api.get<News>(`/news/${id}`);
    return response;
  },

  // Get single news by slug
  getNewsBySlug: async (slug: string): Promise<News> => {
    const response = await api.get<News>(`/news/slug/${slug}`);
    return response;
  },

  // Get featured news
  getFeaturedNews: async (limit: number = 5): Promise<News[]> => {
    const response = await api.get<NewsListResponse>(
      `/news/featured?limit=${limit}`
    );
    return response.news;
  },

  // Get news by category
  getNewsByCategory: async (
    category: string,
    limit: number = 10
  ): Promise<News[]> => {
    const response = await api.get<NewsListResponse>(
      `/news/category/${category}?limit=${limit}`
    );
    return response.news;
  },

  // Search news
  searchNews: async (query: string, limit: number = 10): Promise<News[]> => {
    const response = await api.get<NewsListResponse>(
      `/news/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.news;
  },

  // Get related news
  getRelatedNews: async (
    newsId: string,
    limit: number = 4
  ): Promise<News[]> => {
    const response = await api.get<NewsListResponse>(
      `/news/${newsId}/related?limit=${limit}`
    );
    return response.news;
  },

  // Increment views
  incrementViews: async (id: string): Promise<void> => {
    await api.post(`/news/${id}/views`);
  },

  // Like news
  likeNews: async (id: string): Promise<{ likes: number }> => {
    const response = await api.post<{ likes: number }>(`/news/${id}/like`);
    return response;
  },

  // Unlike news
  unlikeNews: async (id: string): Promise<{ likes: number }> => {
    const response = await api.delete<{ likes: number }>(`/news/${id}/like`);
    return response;
  },
};
