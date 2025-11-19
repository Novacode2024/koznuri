import api from "./api";

// Company Address Types
export interface CompanyAddress {
  title_uz: string;
  title_kr: string;
  address_uz: string;
  address_kr: string;
  address_ru: string;
  address_en: string;
  address_tj: string;
  address_kz: string;
  map_embed: string;
}

// Company Addresses API Service
export const companyAddressesService = {
  // Get all company addresses
  getCompanyAddresses: async (): Promise<CompanyAddress[]> => {
    return api.get<CompanyAddress[]>("/company-addresses/");
  },
};

