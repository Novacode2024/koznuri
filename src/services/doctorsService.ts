import api from "./api";

// Doctor Types from API
export interface DoctorBranch {
  uuid: string;
  is_active: boolean;
  title_uz: string;
  title_kr: string;
  title_ru: string;
  title_en: string;
  title_tj: string;
  title_kz: string;
  title_kg: string;
  phone: string;
  address_uz: string;
  address_kr: string;
  address_ru: string;
  address_en: string;
  address_tj: string;
  address_kz: string;
  address_kg: string;
  email: string;
  map_embed: string;
}

export interface Doctor {
  uuid: string;
  branch: DoctorBranch;
  image: string;
  experience: string;
  full_name: string;
  full_name_uz?: string;
  full_name_kr?: string;
  full_name_ru?: string;
  full_name_en?: string;
  full_name_tj?: string;
  full_name_kz?: string;
  full_name_kg?: string;
  job_uz: string;
  job_kr: string;
  job_ru: string;
  job_en: string;
  job_tj: string;
  job_kz: string;
  job_kg: string;
  order: number;
  service_price: number | null;
  description_uz: string;
  description_kr: string;
  description_ru: string;
  description_en: string;
  description_tj: string;
  description_kz: string;
  description_kg: string;
  user: string | null;
}

// Type-safe helper to get localized content
export type DoctorLocale = 'uz' | 'kr' | 'ru' | 'en' | 'tj' | 'kz' | 'kg';

export interface LocalizedDoctor {
  uuid: string;
  branch: DoctorBranch;
  image: string;
  experience: string;
  fullName: string;
  job: string;
  order: number;
  servicePrice: number | null;
  description: string;
}

// Helper function to localize doctor
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const getFirstNonEmpty = (
  ...values: Array<string | undefined | null>
): string => {
  for (const value of values) {
    if (isNonEmptyString(value)) {
      return value;
    }
  }
  return "";
};

const getLocalizedFullName = (doctor: Doctor, locale: DoctorLocale): string => {
  const localizedKey = `full_name_${locale}` as keyof Doctor;
  const localizedValue = doctor[localizedKey];
  if (isNonEmptyString(localizedValue)) {
    return localizedValue;
  }

  return getFirstNonEmpty(
    doctor.full_name,
    doctor.full_name_uz,
    doctor.full_name_ru,
    doctor.full_name_en,
    doctor.full_name_kr,
    doctor.full_name_tj,
    doctor.full_name_kz,
    doctor.full_name_kg
  );
};

const getLocalizedJob = (doctor: Doctor, locale: DoctorLocale): string => {
  const localizedKey = `job_${locale}` as keyof Doctor;
  const localizedValue = doctor[localizedKey];
  if (isNonEmptyString(localizedValue)) {
    return localizedValue;
  }

  return getFirstNonEmpty(
    doctor.job_uz,
    doctor.job_ru,
    doctor.job_en,
    doctor.job_kr,
    doctor.job_tj,
    doctor.job_kz,
    doctor.job_kg
  );
};

const getLocalizedDescription = (
  doctor: Doctor,
  locale: DoctorLocale
): string => {
  const localizedKey = `description_${locale}` as keyof Doctor;
  const localizedValue = doctor[localizedKey];
  if (isNonEmptyString(localizedValue)) {
    return localizedValue;
  }

  return getFirstNonEmpty(
    doctor.description_uz,
    doctor.description_ru,
    doctor.description_en,
    doctor.description_kr,
    doctor.description_tj,
    doctor.description_kz,
    doctor.description_kg
  );
};

export const localizeDoctor = (
  doctor: Doctor,
  locale: DoctorLocale
): LocalizedDoctor => {
  return {
    uuid: doctor.uuid,
    branch: doctor.branch,
    image: doctor.image,
    experience: doctor.experience,
    fullName: getLocalizedFullName(doctor, locale),
    job: getLocalizedJob(doctor, locale),
    order: doctor.order,
    servicePrice: doctor.service_price,
    description: getLocalizedDescription(doctor, locale),
  };
};

// Doctor Price Response
export interface DoctorPrice {
  price?: string | number;
  service_price?: string;
}

// Age Price Response
export interface AgePrice {
  price: number;
}

type LocalizedFieldPrefix =
  | "full_name"
  | "job"
  | "description";

type LocalizedFieldMap<P extends LocalizedFieldPrefix> = Partial<
  Record<`${P}_${DoctorLocale}`, string>
>;

interface TopDoctorApiResponse
  extends LocalizedFieldMap<"full_name">,
    LocalizedFieldMap<"job">,
    LocalizedFieldMap<"description"> {
  uuid: string;
  branch: DoctorBranch;
  image: string;
  experience?: string | number;
  order?: number | string;
  service_price?: string | number | null;
  top?: boolean;
  user?: string | null;
  full_name?: string;
}

const parseServicePrice = (
  price?: string | number | null
): number | null => {
  if (typeof price === "number") {
    return Number.isFinite(price) ? price : null;
  }
  if (typeof price === "string") {
    const cleaned = price.replace(/[^\d.,-]/g, "").replace(",", ".");
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const toNumericOrder = (value?: number | string): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const toExperienceString = (value?: string | number): string => {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value);
};

const normalizeTopDoctor = (doctor: TopDoctorApiResponse): Doctor => {
  const fullName = getFirstNonEmpty(
    doctor.full_name,
    doctor.full_name_uz,
    doctor.full_name_ru,
    doctor.full_name_en,
    doctor.full_name_kr,
    doctor.full_name_tj,
    doctor.full_name_kz,
    doctor.full_name_kg
  );

  return {
    uuid: doctor.uuid,
    branch: doctor.branch,
    image: doctor.image || "",
    experience: toExperienceString(doctor.experience),
    full_name: fullName,
    full_name_uz: doctor.full_name_uz || "",
    full_name_kr: doctor.full_name_kr || "",
    full_name_ru: doctor.full_name_ru || "",
    full_name_en: doctor.full_name_en || "",
    full_name_tj: doctor.full_name_tj || "",
    full_name_kz: doctor.full_name_kz || "",
    full_name_kg: doctor.full_name_kg || "",
    job_uz: doctor.job_uz || "",
    job_kr: doctor.job_kr || "",
    job_ru: doctor.job_ru || "",
    job_en: doctor.job_en || "",
    job_tj: doctor.job_tj || "",
    job_kz: doctor.job_kz || "",
    job_kg: doctor.job_kg || "",
    order: toNumericOrder(doctor.order),
    service_price: parseServicePrice(doctor.service_price),
    description_uz: doctor.description_uz || "",
    description_kr: doctor.description_kr || "",
    description_ru: doctor.description_ru || "",
    description_en: doctor.description_en || "",
    description_tj: doctor.description_tj || "",
    description_kz: doctor.description_kz || "",
    description_kg: doctor.description_kg || "",
    user: doctor.user ?? null,
  };
};

// Doctors API Service
export const doctorsService = {
  // Get all doctors
  getDoctors: async (): Promise<Doctor[]> => {
    return api.get<Doctor[]>("/doctors/");
  },

  getDoctorById: async (uuid: string): Promise<Doctor> => {
    return api.get<Doctor>(`/doctors/${uuid}/`);
  },

  // Get doctors by branch UUID
  getDoctorsByBranch: async (branchUuid: string): Promise<Doctor[]> => {
    // Remove any trailing slashes and trim whitespace
    const cleanUuid = branchUuid.trim().replace(/\/+$/, '');
    if (!cleanUuid) {
      throw new Error("Branch UUID is required");
    }
    return api.get<Doctor[]>(`/doctor-filter/${cleanUuid}/`);
  },

  // Get doctor price by UUID
  getDoctorPrice: async (doctorUuid: string): Promise<DoctorPrice> => {
    // Remove any trailing slashes and trim whitespace
    const cleanUuid = doctorUuid.trim().replace(/\/+$/, '');
    if (!cleanUuid) {
      throw new Error("Doctor UUID is required");
    }
    return api.get<DoctorPrice>(`/doctor-price/${cleanUuid}/`);
  },

  // Get price by age
  getPriceByAge: async (age: number): Promise<AgePrice> => {
    if (!age || age < 1 || age > 100) {
      throw new Error("Age must be between 1 and 100");
    }
    return api.get<AgePrice>(`/price-by-age/${age}`);
  },

  // Get top doctors
  getTopDoctors: async (): Promise<Doctor[]> => {
    const response = await api.get<TopDoctorApiResponse[]>(
      "/top-doctors/"
    );

    if (!Array.isArray(response)) {
      return [];
    }

    return response.map(normalizeTopDoctor);
  },
};
