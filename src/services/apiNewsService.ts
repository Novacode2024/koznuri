import api from './api';
import type { NewsItem } from '../types/News';

export const getNews = async (limit: number = 10): Promise<NewsItem[]> => {
  try {
    const response = await api.get<NewsItem[]>('/news/', { skipAuth: true });
    // Sort by order and take only specified limit
    const sorted = response.sort((a, b) => a.order - b.order);
    return sorted.slice(0, limit);
  } catch (err) {
    throw err;
  }
};

export const getNewsById = async (uuid: string): Promise<NewsItem | null> => {
  try {
    const response = await api.get<NewsItem[]>('/news/', { skipAuth: true });
    const news = response.find(item => item.uuid === uuid);
    return news || null;
  } catch (err) {
    throw err;
  }
};

