import { useQuery } from "@tanstack/react-query";
import {
  guidesService,
  type Guide,
  type GuideDetail,
} from "../services/guidesService";

export function useGuides() {
  return useQuery<Guide[], Error>({
    queryKey: ["guides"],
    queryFn: () => guidesService.getGuides(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useGuideById(uuid: string | null, enabled = true) {
  return useQuery<GuideDetail, Error>({
    queryKey: ["guide", uuid],
    queryFn: () => guidesService.getGuideById(uuid as string),
    enabled: Boolean(uuid) && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}


