import api from "./api";

export interface GalleryItem {
  uuid: string;
  image: string;
  order: number;
}

export const galleryService = {
  getGalleryImages: async (): Promise<GalleryItem[]> => {
    return api.get<GalleryItem[]>("/gallery/");
  },
};

