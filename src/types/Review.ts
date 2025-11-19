export interface Review {
  uuid: string;
  name?: string;
  client?: string;
  image: string | null;
  description_uz: string;
  description_kr: string;
  description_ru: string;
  description_en: string;
  description_tj: string;
  description_kz: string;
  description_kg: string;
  confirmed: boolean;
  order: number;
}

export interface ReviewResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Review[];
}

