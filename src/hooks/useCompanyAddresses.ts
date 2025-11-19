import { useApi } from "./useApi";
import {
  companyAddressesService,
  CompanyAddress,
} from "../services/companyAddressesService";

// Hook for getting company addresses
export function useCompanyAddresses() {
  return useApi<CompanyAddress[]>(() => companyAddressesService.getCompanyAddresses(), []);
}

