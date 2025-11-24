import api from "./api";

export interface CompanyInfo {
  uuid: string;
  title_uz: string | null;
  title_kr: string | null;
  title_ru: string | null;
  title_en: string | null;
  title_tj: string | null;
  title_kz: string | null;
  title_kg: string | null;
  start_time: string | null;
  end_time: string | null;
  whatsapp: string | null;
  email: string | null;
  phone: string | null;
}

const normalizeCompanyInfo = (info: CompanyInfo): CompanyInfo => ({
  uuid: info.uuid,
  title_uz: info.title_uz ?? "",
  title_kr: info.title_kr ?? "",
  title_ru: info.title_ru ?? "",
  title_en: info.title_en ?? "",
  title_tj: info.title_tj ?? "",
  title_kz: info.title_kz ?? "",
  title_kg: info.title_kg ?? "",
  start_time: info.start_time ?? "",
  end_time: info.end_time ?? "",
  whatsapp: info.whatsapp ?? "",
  email: info.email ?? "",
  phone: info.phone ?? "",
});

export const companyInfoService = {
  getCompanyInfo: async (): Promise<CompanyInfo | null> => {
    const response = await api.get<CompanyInfo[] | CompanyInfo>("/company-info/");

    if (Array.isArray(response)) {
      const firstItem = response[0];
      return firstItem ? normalizeCompanyInfo(firstItem) : null;
    }

    return response ? normalizeCompanyInfo(response) : null;
  },
};

