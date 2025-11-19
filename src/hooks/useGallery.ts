import { useQuery } from "@tanstack/react-query";
import { galleryService, type GalleryItem } from "../services/galleryService";

// Hook for getting gallery images
export const useGallery = () => {
  return useQuery<GalleryItem[], Error>({
    queryKey: ["gallery"],
    queryFn: galleryService.getGalleryImages,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

