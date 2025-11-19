import api from "./api";

// Company Email Types
export interface CompanyEmail {
  uuid: string;
  email: string;
}

// Company Email API Service
export const companyEmailService = {
  // Get company email
  getCompanyEmail: async (): Promise<CompanyEmail> => {
    return api.get<CompanyEmail>("/company-email/");
  },
};

