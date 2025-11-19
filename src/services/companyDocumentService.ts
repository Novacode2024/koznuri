import api from "./api";

// Company Document Types
export interface CompanyDocument {
  document_url: string;
}

// Company Document API Service
export const companyDocumentService = {
  // Get company document
  getCompanyDocument: async (): Promise<CompanyDocument> => {
    return api.get<CompanyDocument>("/compamy-document/");
  },
};

