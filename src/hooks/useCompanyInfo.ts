import { useApi } from "./useApi";
import {
  companyInfoService,
  type CompanyInfo,
} from "../services/companyInfoService";

export function useCompanyInfo() {
  return useApi<CompanyInfo | null>(
    () => companyInfoService.getCompanyInfo(),
    []
  );
}

