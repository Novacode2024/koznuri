import axios from 'axios';
import type { Review } from '../types/Review';

const API_BASE_URL = 'https://koznuri.novacode.uz/api';

export const getReviews = async (): Promise<Review[]> => {
  const response = await axios.get<Review[]>(`${API_BASE_URL}/reviews/`);
  return response.data || [];
};

