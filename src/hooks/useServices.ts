import { useQuery } from "@tanstack/react-query";
import { servicesService, Service } from "../services/servicesService";

// Hook for getting all services
export function useServices() {
  return useQuery<Service[], Error>({
    queryKey: ["services"],
    queryFn: () => servicesService.getServices(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting popular services
export function usePopularServices() {
  return useQuery<Service[], Error>({
    queryKey: ["popular-services"],
    queryFn: () => servicesService.getPopularServices(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting single service by UUID
export function useServiceById(uuid: string) {
  return useQuery<Service, Error>({
    queryKey: ["service", uuid],
    queryFn: () => servicesService.getServiceById(uuid),
    enabled: !!uuid,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
