import api from "./api";

// Branch Map Types
export interface BranchMap {
  title_uz: string;
  title_kr: string;
  latitude: string | null;
  longitude: string | null;
  map_embed: string;
}

// Branch Map API Service
export const branchMapService = {
  getBranchMaps: async (): Promise<BranchMap[]> => {
    const response = await api.get<BranchMap[]>("/banch-map/list/");
    
    // API to'g'ridan-to'g'ri array qaytaradi
    if (!Array.isArray(response)) {
      return [];
    }
    
    return response.map((branch) => ({
      title_uz: branch.title_uz || "",
      title_kr: branch.title_kr || "",
      latitude: branch.latitude || null,
      longitude: branch.longitude || null,
      map_embed: branch.map_embed || "",
    }));
  },
};

