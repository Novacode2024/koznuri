import { useQuery } from "@tanstack/react-query";
import {
  socialVideosService,
  type SocialVideo,
} from "../services/socialVideosService";

// Hook for getting all social videos
export const useSocialVideos = () => {
  return useQuery<SocialVideo[], Error>({
    queryKey: ["socialVideos"],
    queryFn: socialVideosService.getSocialVideos,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for getting popular social videos
export const usePopularVideos = () => {
  return useQuery<SocialVideo[], Error>({
    queryKey: ["popularVideos"],
    queryFn: socialVideosService.getPopularVideos,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
