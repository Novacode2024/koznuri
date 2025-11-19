export interface FAQ {
  uuid: string;
  question_uz: string;
  question_kr: string;
  question_ru: string;
  question_en: string;
  question_tj: string;
  question_kz: string;
  question_kg: string;
  answer_uz: string;
  answer_kr: string;
  answer_ru: string;
  answer_en: string;
  answer_tj: string;
  answer_kz: string;
  answer_kg: string;
  order: number;
}

export interface FAQResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FAQ[];
}

