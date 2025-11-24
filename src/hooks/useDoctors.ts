import { useQuery } from "@tanstack/react-query";
import { doctorsService, Doctor } from "../services/doctorsService";

// Hook for getting all doctors
export function useDoctors() {
  return useQuery<Doctor[], Error>({
    queryKey: ["doctors"],
    queryFn: () => doctorsService.getDoctors(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTopDoctors() {
  return useQuery<Doctor[], Error>({
    queryKey: ["top-doctors"],
    queryFn: () => doctorsService.getTopDoctors(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook for getting single doctor by UUID
export function useDoctorById(uuid: string) {
  return useQuery<Doctor, Error>({
    queryKey: ["doctor", uuid],
    queryFn: () => doctorsService.getDoctorById(uuid),
    enabled: !!uuid,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
