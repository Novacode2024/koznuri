import { useQuery } from "@tanstack/react-query";
import { technologiesService, Technology } from "../services/technologiesService";

// Hook for getting all technologies
export function useTechnologies() {
  return useQuery<Technology[], Error>({
    queryKey: ["technologies"],
    queryFn: () => technologiesService.getTechnologies(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

