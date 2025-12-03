import { useMemo, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AllHeader from "../components/AllHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import AppointmentFormModal from "../components/AppointmentFormModal";
import InterestModal from "../components/InterestModal";
import SEO from "../components/SEO";
import { useServiceById, useServices } from "../hooks/useServices";
import { localizeService, type ServiceLocale } from "../services/servicesService";
import { sanitizeHtml } from "../utils/sanitize";

const ServiceDetail = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  
  // Always call hooks in the same order, regardless of uuid value
  const { data: service, isLoading: isLoadingDetail, error: detailError } = useServiceById(uuid || "");
  // Always call useServices hook unconditionally to maintain hook order
  const { data: allServices } = useServices();

  // Get service locale from i18n language
  const serviceLocale = useMemo((): ServiceLocale => {
    const lang = i18n.language;
    const localeMap: Record<string, ServiceLocale> = {
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

  // Localize current service
  const localizedService = useMemo(() => {
    if (!service) return null;
    return localizeService(service, serviceLocale);
  }, [service, serviceLocale]);

  // Localize related services (all services except current)
  const localizedRelatedServices = useMemo(() => {
    if (!allServices || !service) return [];
    return allServices
      .filter((s) => s.uuid !== service.uuid)
      .map((s) => localizeService(s, serviceLocale))
      .sort((a, b) => a.order - b.order)
      .slice(0, 8);
  }, [allServices, service, serviceLocale]);

  // Helper function to get image URL - use useCallback to ensure stability
  const getImageUrl = useCallback((image: string): string => {
    if (image.startsWith("http")) return image;
    return `https://koznuri.novacode.uz${image}`;
  }, []);

  // Structured data for service - must be called before early returns
  const serviceStructuredData = useMemo(() => {
    if (!localizedService) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "MedicalProcedure",
      "name": localizedService.title,
      "description": localizedService.description.substring(0, 200),
      "image": getImageUrl(localizedService.image || ""),
      "provider": {
        "@type": "MedicalOrganization",
        "name": "Ko'z Nuri - Eye Medical Center",
        "url": "https://koznuri.novacode.uz"
      },
      "url": `https://koznuri.novacode.uz/service/${localizedService.uuid}`,
      "medicalSpecialty": "Ophthalmology"
    };
  }, [localizedService, getImageUrl]);

  if (isLoadingDetail) {
    return (
      <div>
        <AllHeader title="Хизмат тафсилотлари" link="/services" />
        <div className="max-w-[1380px] mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" text={t("common.loading")} />
          </div>
        </div>
      </div>
    );
  }

  if (detailError || !localizedService) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t("common.serviceNotFound") || "Хизмат топилмади"}
          </h1>
          <button 
            onClick={() => navigate("/services")}
            className="bg-[#1857FE] text-white px-6 py-3 rounded-lg hover:bg-[#0d47e8] transition-colors duration-200 cursor-pointer"
          >
            {t("common.backToServices") || "Хизматларга қайтиш"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {localizedService && (
        <SEO
          title={`${localizedService.title} | Ko'z Nuri Xizmatlari`}
          description={localizedService.subtitle || localizedService.description.substring(0, 160)}
          keywords={`${localizedService.title}, ko'z tibbiy xizmatlari, oftalmologiya, ${localizedService.subtitle}, Toshkent`}
          image={getImageUrl(localizedService.image || "")}
          canonical={`https://koznuri.novacode.uz/service/${localizedService.uuid}`}
          structuredData={serviceStructuredData}
        />
      )}
      <div>
        <AllHeader title="Хизмат тафсилотлари" link="/services" />
      
      <div className="max-w-[1380px]  mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-8">
      {/* Main Service Content */}
      <div className="space-y-8 mb-10">
            {/* Top Section - Service Overview */}
          <div className="">
            <h1 className="text-3xl font-bold text-[#1857FE] mb-4">{localizedService.title}</h1>
            
            {/* Subtitle */}
            <div className="mb-6">
              <p className="text-xl text-gray-600 font-medium">
                {localizedService.subtitle}
              </p>
            </div>

            {/* Description */}
            <div className="text-gray-700 space-y-4">
              <div
                className="text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(localizedService.description) }}
              />
            </div>
          </div>

          {/* Image Section */}
          {localizedService.image && (
            <div className="bg-white rounded-xl p-8">
              <div className="relative w-full h-[500px] rounded-xl overflow-hidden">
                <img
                  src={getImageUrl(localizedService.image)}
                  alt={localizedService.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNlcnZpY2UgSW1hZ2U8L3RleHQ+PC9zdmc+";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-700/30"></div>
              </div>
            </div>
          )}
        </div>

          {/* Call to Action Buttons */}
          <div className="bg-white rounded-xl p-8">
                <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setIsAppointmentModalOpen(true)}
                className="flex-1 bg-[#1857FE] text-white px-8 cursor-pointer py-4 rounded-lg font-semibold text-lg hover:bg-[#0d47e8] transition-colors duration-200">
                {t("common.bookAppointment") || "Қабулга ёзилиш"}
                  </button>
              <button 
                onClick={() => {
                  // Check if user is authenticated
                  const token = localStorage.getItem("auth_token");
                  if (!token) {
                    // Redirect to login page if not authenticated
                    navigate("/login");
                  } else {
                    // Open interest modal if authenticated
                    setIsInterestModalOpen(true);
                  }
                }}
                className="flex-1 border border-[#1857FE] text-[#1857FE] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#1857FE] hover:text-white transition-colors duration-200 cursor-pointer">
                {t("common.consultation") || "Машвара олиш"}
              </button>
                </div>
              </div>
        </div>

        {/* Related Services */}
        {localizedRelatedServices.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              {t("common.relatedServices") || "Бошқа хизматлар"}
            </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {localizedRelatedServices.slice(0, 4).map((relatedService, index) => (
              <article
                  key={relatedService.uuid}
                  className="group relative flex flex-col rounded-[33px] bg-white text-[#282828] hover:bg-[#1857FE] hover:text-white p-6 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl animate-[fade-in-up_0.6s_ease-out_forwards] h-full"
                style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                  aria-labelledby={`service-${relatedService.uuid}-title`}
                >
                  {/* Service Number */}
                  <div className="text-6xl h-[40px] overflow-hidden mb-4 transition-colors duration-300 text-[#1857FE]/20 group-hover:text-white/30">
                    {(index + 1).toString().padStart(2, "0")}
                </div>

                {/* Service Title */}
                <h3 
                    id={`service-${relatedService.uuid}-title`}
                    className="font-bold mb-3 text-xl transition-colors duration-300 text-[#282828] group-hover:text-white"
                  >
                    {relatedService.title}
                </h3>

                  {/* Service Subtitle */}
                  <p className="mb-4 flex-grow leading-relaxed text-sm transition-colors duration-300 text-[#747474] group-hover:text-white/90 line-clamp-2">
                    {relatedService.subtitle}
                </p>

                {/* Action Link */}
                <Link 
                    to={`/service/${relatedService.uuid}`}
                    className="inline-block mt-auto font-semibold hover:underline transition-all duration-200 text-sm text-[#1857FE] hover:text-white group-hover:text-white/80"
                  >
                    {t("common.readMore") || "Батафсил"}
                </Link>
              </article>
            ))}
        </div>  

            {localizedRelatedServices.length > 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {localizedRelatedServices.slice(4, 8).map((relatedService, index) => (
              <article
                    key={relatedService.uuid}
                    className="group relative flex flex-col rounded-[33px] bg-white text-[#282828] hover:bg-[#1857FE] hover:text-white p-6 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl animate-[fade-in-up_0.6s_ease-out_forwards] h-full"
                style={{
                      animationDelay: `${(index + 4) * 0.1}s`,
                }}
                    aria-labelledby={`service-${relatedService.uuid}-title`}
              >
                {/* Service Number */}
                    <div className="text-6xl h-[40px] overflow-hidden mb-4 transition-colors duration-300 text-[#1857FE]/20 group-hover:text-white/30">
                      {(index + 5).toString().padStart(2, "0")}
                </div>

                {/* Service Title */}
                <h3 
                      id={`service-${relatedService.uuid}-title`}
                      className="font-bold mb-3 text-xl transition-colors duration-300 text-[#282828] group-hover:text-white"
                    >
                      {relatedService.title}
                </h3>

                    {/* Service Subtitle */}
                    <p className="mb-4 flex-grow leading-relaxed text-sm transition-colors duration-300 text-[#747474] group-hover:text-white/90 line-clamp-2">
                      {relatedService.subtitle}
                </p>

                {/* Action Link */}
                <Link 
                      to={`/service/${relatedService.uuid}`}
                      className="inline-block mt-auto font-semibold hover:underline transition-all duration-200 text-sm text-[#1857FE] hover:text-white group-hover:text-white/80"
                    >
                      {t("common.readMore") || "Батафсил"}
                </Link>
              </article>
            ))}
        </div>  
            )}
        </div>
        )}

      {/* Appointment Form Modal */}
      <AppointmentFormModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
      />

      {/* Interest Modal */}
      <InterestModal
        isOpen={isInterestModalOpen}
        onClose={() => setIsInterestModalOpen(false)}
      />
      </div>
      </div>
    </>
  );
};

export default ServiceDetail;
