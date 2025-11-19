import axios from 'axios';
import type { Banner } from '../types/Banner';

const API_BASE_URL = 'https://koznuri.novacode.uz/api';

export const getBanners = async (): Promise<Banner[]> => {
  try {
    const response = await axios.get<Banner[]>(`${API_BASE_URL}/banners/`);
    return response.data || [];
  } catch (error) {
    throw error;
  }
};

