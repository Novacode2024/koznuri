import axios from 'axios';
import type { About } from '../types/About';

const API_BASE_URL = 'https://koznuri.novacode.uz/api';

export const getAbout = async (): Promise<About> => {
  try {
    const response = await axios.get<About>(`${API_BASE_URL}/about-us/`);
    return response.data;
  } catch (err) {
    throw err;
  }
};
