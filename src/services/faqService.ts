import axios from 'axios';
import type { FAQ } from '../types/FAQ';

const API_BASE_URL = 'https://koznuri.novacode.uz/api';

export const getFaqs = async (): Promise<FAQ[]> => {
  const response = await axios.get<FAQ[]>(`${API_BASE_URL}/faqs/`);
  return response.data || [];
};

