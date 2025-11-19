import api from "./api";
import type { ServiceLocale } from "./servicesService";

type LanguageCode = "uz" | "kr" | "ru" | "en" | "tj" | "kz" | "kg";

type GuideField =
  | "title"
  | "description"
  | "content"
  | "file"
  | "video";

type LocalizedFields = {
  [Key in `${GuideField}_${LanguageCode}`]?: string | null;
};

export interface Guide extends LocalizedFields {
  uuid: string;
  order?: number | null;
  preview_image?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface GuideDetail extends Guide {
  // Some APIs may provide additional rich text field names like body or text
  body?: string | null;
  text?: string | null;
}

export interface LocalizedGuide {
  uuid: string;
  title: string;
  description: string;
  content: string;
  order: number;
  fileUrl: string | null;
  videoUrl: string | null;
  previewImage?: string | null;
}

const LANGUAGE_KEY_MAP: Record<ServiceLocale, LanguageCode> = {
  uz: "uz",
  kr: "kr",
  ru: "ru",
  en: "en",
  tj: "tj",
  kz: "kz",
  kg: "kg",
};

const MEDIA_BASE_URL = "https://koznuri.novacode.uz";

const buildMediaUrl = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${MEDIA_BASE_URL}${value}`;
  }

  return `${MEDIA_BASE_URL}/${value}`;
};

const pickLocalizedValue = (
  guide: Guide | GuideDetail,
  field: GuideField,
  locale: ServiceLocale
): string | null => {
  const langKey = LANGUAGE_KEY_MAP[locale];
  const key = `${field}_${langKey}` as keyof Guide;
  const value = guide[key];

  if (typeof value === "string") {
    return value;
  }

  return null;
};

export const localizeGuide = (
  guide: Guide | GuideDetail,
  locale: ServiceLocale
): LocalizedGuide => {
  const title =
    pickLocalizedValue(guide, "title", locale) ||
    pickLocalizedValue(guide, "title", "uz") ||
    pickLocalizedValue(guide, "title", "kr") ||
    "";

  const description =
    pickLocalizedValue(guide, "description", locale) ||
    pickLocalizedValue(guide, "description", "uz") ||
    pickLocalizedValue(guide, "description", "kr") ||
    "";

  const content =
    pickLocalizedValue(guide, "content", locale) ||
    (('body' in guide && guide.body) || ('text' in guide && guide.text) || "") ||
    pickLocalizedValue(guide, "description", locale) ||
    "";

  const fileUrl = buildMediaUrl(pickLocalizedValue(guide, "file", locale));
  const videoUrl = pickLocalizedValue(guide, "video", locale);

  return {
    uuid: guide.uuid,
    title,
    description,
    content,
    order: guide.order ?? 0,
    fileUrl,
    videoUrl: videoUrl ? videoUrl : null,
    previewImage: guide.preview_image ?? null,
  };
};

export const guidesService = {
  getGuides: async (): Promise<Guide[]> => {
    return api.get<Guide[]>("/guides/");
  },

  getGuideById: async (uuid: string): Promise<GuideDetail> => {
    return api.get<GuideDetail>(`/guides/${uuid}/`);
  },
};


