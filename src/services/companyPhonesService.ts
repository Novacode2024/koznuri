import api from "./api";

// Company Phone Types (Branch)
export interface CompanyPhone {
  uuid: string;
  is_active: boolean;
  title_uz: string;
  title_kr: string;
  title_ru: string;
  title_en: string;
  title_tj: string;
  title_kz: string;
  phone: string;
  address_uz: string;
  address_kr: string;
  address_ru: string;
  address_en: string;
  address_tj: string;
  address_kz: string;
  email: string;
  map_embed: string;
  latitude: string;
  longitude: string;
  order?: number; // Optional order field for sorting
}

// Company Phones API Service
export const companyPhonesService = {
  getCompanyPhones: async (): Promise<CompanyPhone[]> => {
    const response = await api.get<CompanyPhone[]>("/branches/");
    
    // API to'g'ridan-to'g'ri array qaytaradi
    if (!Array.isArray(response)) {
      return [];
    }
    
    // UUID mavjudligini tekshirish va normalize qilish
    const normalizedBranches = response
      .map((branch) => {
        // UUID mavjudligini tekshirish
        if (!branch.uuid) {
          return null;
        }
        
        // API response strukturasi to'g'ri, shuning uchun to'g'ridan-to'g'ri ishlatish mumkin
        return {
          uuid: branch.uuid,
          is_active: branch.is_active ?? true,
          title_uz: branch.title_uz || "",
          title_kr: branch.title_kr || "",
          title_ru: branch.title_ru || "",
          title_en: branch.title_en || "",
          title_tj: branch.title_tj || "",
          title_kz: branch.title_kz || "",
          phone: branch.phone || "",
          address_uz: branch.address_uz || "",
          address_kr: branch.address_kr || "",
          address_ru: branch.address_ru || "",
          address_en: branch.address_en || "",
          address_tj: branch.address_tj || "",
          address_kz: branch.address_kz || "",
          email: branch.email || "",
          map_embed: branch.map_embed || "",
          latitude: branch.latitude || "",
          longitude: branch.longitude || "",
        } as CompanyPhone;
      })
      .filter((branch): branch is CompanyPhone => branch !== null);
    
    return normalizedBranches;
  },
};
