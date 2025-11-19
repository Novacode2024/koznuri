import { useApi } from "./useApi";
import {
  companyEmailService,
  CompanyEmail,
} from "../services/companyEmailService";

export function useCompanyEmail() {
  return useApi<CompanyEmail>(() => companyEmailService.getCompanyEmail(), []);
}

