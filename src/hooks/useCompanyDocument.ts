import { useApi } from "./useApi";
import {
  companyDocumentService,
  CompanyDocument,
} from "../services/companyDocumentService";

export function useCompanyDocument() {
  return useApi<CompanyDocument>(() => companyDocumentService.getCompanyDocument(), []);
}

