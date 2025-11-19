export interface Hashtag {
  uuid: string;
  title_uz: string;
  title_kr: string;
  title_ru: string;
  title_en: string;
  title_tj: string;
  title_kz: string;
  title_kg: string;
}

export interface NewsItem {
  uuid: string;
  title_uz: string;
  title_kr: string;
  title_ru: string;
  title_en: string;
  title_tj: string;
  title_kz: string;
  title_kg: string;
  description_uz: string;
  description_kr: string;
  description_ru: string;
  description_en: string;
  description_tj: string;
  description_kz: string;
  description_kg: string;
  hashtags: Hashtag[];
  date: string;
  image: string;
  order: number;
}

