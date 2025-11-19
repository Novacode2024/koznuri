import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AllHeader from "../components/AllHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import AppointmentModal, { AppointmentFormData } from "../components/AppointmentModal";
import SEO from "../components/SEO";
import { useDoctorById } from "../hooks/useDoctors";
import { localizeDoctor, type DoctorLocale, type LocalizedDoctor } from "../services/doctorsService";
import { sanitizeHtml } from "../utils/sanitize";

const DoctorDetail = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: doctor, isLoading, error } = useDoctorById(uuid || "");

  // Get doctor locale from i18n language
  const doctorLocale = useMemo((): DoctorLocale => {
    const lang = i18n.language;
    const localeMap: Record<string, DoctorLocale> = {
      "uz-latin": "uz",
      "uz-cyrillic": "kr",
      ru: "ru",
      en: "en",
      tg: "tj",
      kz: "kz",
      ky: "kg",
    };
    return localeMap[lang] || "kr";
  }, [i18n.language]);

  // Localize current doctor
  const localizedDoctor = useMemo<LocalizedDoctor | null>(() => {
    if (!doctor) return null;
    return localizeDoctor(doctor, doctorLocale);
  }, [doctor, doctorLocale]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitAppointment = (_formData: AppointmentFormData) => {
    void _formData;
    // API call is handled in AppointmentModal component
    // This callback is kept for backward compatibility
  };

  const handleBookAppointment = () => {
    setIsModalOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div>
        <AllHeader title={t("common.doctors") || "Докторлар"} link="/doctors" />
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
          <div className="flex items-center justify-center min-h-[280px] sm:min-h-[340px] md:min-h-[400px]">
            <LoadingSpinner size="lg" text={t("common.loading")} />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !localizedDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
            {t("common.errorOccurred") || "Хатолик юз берди"}
          </h1>
          <button 
            onClick={() => navigate("/doctors")}
            className="bg-[#1857FE] text-white px-5 py-3 sm:px-6 sm:py-3 rounded-lg hover:bg-[#0d47e8] transition-colors duration-200"
          >
            {t("doctors.allDoctors") || "Барча докторлар"}
          </button>
        </div>
      </div>
    );
  }

  const getImageUrl = (image: string): string => {
    if (image.startsWith("http")) return image;
    return `https://koznuri.novacode.uz${image}`;
  };

  // Structured data for doctor
  const doctorStructuredData = useMemo(() => {
    if (!localizedDoctor) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "Physician",
      "name": localizedDoctor.fullName,
      "description": localizedDoctor.description,
      "image": getImageUrl(localizedDoctor.image),
      "medicalSpecialty": "Ophthalmology",
      "worksFor": {
        "@type": "MedicalOrganization",
        "name": "Ko'z Nuri - Eye Medical Center",
        "url": "https://koznuri.novacode.uz"
      },
      "url": `https://koznuri.novacode.uz/doctor/${localizedDoctor.uuid}`,
      "jobTitle": localizedDoctor.job,
      "knowsAbout": ["Ophthalmology", "Eye Surgery", "Laser Correction", "Cataract", "Glaucoma"]
    };
  }, [localizedDoctor]);

  return (
    <>
      {localizedDoctor && (
        <SEO
          title={`${localizedDoctor.fullName} - ${localizedDoctor.job} | Ko'z Nuri`}
          description={`${localizedDoctor.fullName} - ${localizedDoctor.job}. ${localizedDoctor.experience ? `${localizedDoctor.experience} yillik tajriba. ` : ""}${localizedDoctor.description ? localizedDoctor.description.substring(0, 150) + "..." : ""}`}
          keywords={`${localizedDoctor.fullName}, ${localizedDoctor.job}, ko'z shifokori, oftalmolog, ${localizedDoctor.branch.title_uz || localizedDoctor.branch.title_kr || localizedDoctor.branch.title_ru}, Toshkent`}
          image={getImageUrl(localizedDoctor.image)}
          type="profile"
          canonical={`https://koznuri.novacode.uz/doctor/${localizedDoctor.uuid}`}
          structuredData={doctorStructuredData}
        />
      )}
      <div>
        <AllHeader title={t("common.doctors") || "Докторлар"} link="/doctors" />
      
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
        {/* Main Doctor Content */}
        <div className="space-y-8">
          {/* Top Section - Doctor Overview */}
          <div className="rounded-xl p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#E9EEFE] to-white shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Doctor Image */}
              <div className="lg:col-span-1">
                <div className="relative bg-white rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg overflow-hidden">
                  <img 
                    src={getImageUrl(localizedDoctor.image)} 
                    alt={localizedDoctor.fullName}
                    className="w-full h-64 sm:h-80 md:h-[400px] object-cover rounded-xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/400";
                    }}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 space-y-2">
                    <div className="bg-white text-[#1857FE] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-md text-xs sm:text-sm font-semibold">
                      {localizedDoctor.experience} {t("doctors.yearsExperience")}
                    </div>
                    <div className="bg-white text-[#1857FE] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-md text-xs sm:text-sm font-semibold">
                      {localizedDoctor.job}
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                    {localizedDoctor.fullName}
                  </h1>
                  
                  {/* Branch Info */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#1857FE]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-base sm:text-lg text-gray-600 font-medium">
                      {i18n.language === 'uz-cyrillic' ? localizedDoctor.branch.title_kr : 
                       i18n.language === 'uz-latin' ? localizedDoctor.branch.title_uz :
                       i18n.language === 'ru' ? localizedDoctor.branch.title_ru :
                       i18n.language === 'en' ? localizedDoctor.branch.title_en :
                       i18n.language === 'tg' ? localizedDoctor.branch.title_tj :
                       i18n.language === 'kz' ? localizedDoctor.branch.title_kz :
                       localizedDoctor.branch.title_kg}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-5 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#1857FE]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <a href={`tel:${localizedDoctor.branch.phone}`} className="text-base sm:text-lg text-gray-700 hover:text-[#1857FE] transition-colors">
                        {localizedDoctor.branch.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#1857FE]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <a href={`mailto:${localizedDoctor.branch.email}`} className="text-base sm:text-lg text-gray-700 hover:text-[#1857FE] transition-colors">
                        {localizedDoctor.branch.email}
                      </a>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#1857FE] mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-base sm:text-lg text-gray-700">
                        {i18n.language === 'uz-cyrillic' ? localizedDoctor.branch.address_kr : 
                         i18n.language === 'uz-latin' ? localizedDoctor.branch.address_uz :
                         i18n.language === 'ru' ? localizedDoctor.branch.address_ru :
                         i18n.language === 'en' ? localizedDoctor.branch.address_en :
                         i18n.language === 'tg' ? localizedDoctor.branch.address_tj :
                         i18n.language === 'kz' ? localizedDoctor.branch.address_kz :
                         localizedDoctor.branch.address_kg}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Appointment Button */}
                <button
                  onClick={handleBookAppointment}
                  className="w-full bg-[#1857FE] text-white py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-[#0d47e8] transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  {t("common.bookAppointment")}
                </button>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="rounded-xl p-4 sm:p-6 md:p-8 bg-white shadow-lg">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-5 md:mb-6">
              {t("doctors.aboutDoctor") || "Шифокор ҳақида"}
            </h2>
            <div 
              className="prose max-w-none text-gray-700 leading-relaxed text-base sm:text-lg"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(localizedDoctor.description) }}
            />
          </div>
        </div>

        {/* Appointment Modal */}
        <AppointmentModal
          doctor={localizedDoctor}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitAppointment}
        />
      </div>
      </div>
    </>
  );
};

export default DoctorDetail;

