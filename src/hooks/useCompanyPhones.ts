import { useApi } from "./useApi";
import {
  companyPhonesService,
  CompanyPhone,
} from "../services/companyPhonesService";

// Hook for getting company phones
export function useCompanyPhones() {
  return useApi<CompanyPhone[]>(() => companyPhonesService.getCompanyPhones(), []);
}
