import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import AllHeader from "../components/AllHeader";
import Location from "../components/HomeComponents/Location";
import LoadingSpinner from "../components/LoadingSpinner";
import SEO from "../components/SEO";
import { useServices } from "../hooks/useServices";
import { localizeService, type ServiceLocale, type LocalizedService } from "../services/servicesService";

const Servises = () => {
  const { t, i18n } = useTranslation();
  const { data: services, isLoading, error } = useServices();

  // Map i18next language to service locale
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

  // Localize all services based on current language
  const localizedServices: LocalizedService[] = useMemo(() => {
    if (!services) return [];
    return services
      .map((service) => localizeService(service, serviceLocale))
      .sort((a, b) => a.order - b.order);
  }, [services, serviceLocale]);

  // Get services title from translation
  const servicesTitle = useMemo(() => t("common.services"), [t]);

  if (isLoading) {
    return (
      <div>
        <AllHeader title={servicesTitle} link="/services" />
        <div className="max-w-[1380px] mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" text={t("common.loading")} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <AllHeader title={servicesTitle} link="/services" />
        <div className="max-w-[1380px] mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              {t("common.errorOccurred") || "Xatolik yuz berdi"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {error.message || "Ma'lumotlarni yuklashda xatolik"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!localizedServices || localizedServices.length === 0) {
    return (
      <div>
        <AllHeader title={servicesTitle} link="/services" />
        <div className="max-w-[1380px] mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {t("common.noServicesFound") || "Xizmatlar topilmadi"}
            </h3>
            <p className="text-sm text-gray-500">
              {t("common.noServicesAvailable") || "Hozircha xizmatlar mavjud emas"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": servicesTitle,
    "description": "Ko'z Nuri klinikasi - O'zbekistondagi eng zamonaviy ko'z tibbiy xizmatlari. Lazer korreksiyasi, katarakta, glaukoma, retina operatsiyalari va boshqa ko'z kasalliklarini davolash.",
    "url": "https://koznuri.novacode.uz/services",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": localizedServices.length,
      "itemListElement": localizedServices.map((service, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "MedicalProcedure",
          "name": service.title,
          "url": `https://koznuri.novacode.uz/service/${service.uuid}`
        }
      }))
    }
  };

  return (
    <>
      <SEO
        title={`${servicesTitle} | Ko'z Nuri`}
        description="Ko'z Nuri klinikasi - O'zbekistondagi eng zamonaviy ko'z tibbiy xizmatlari. Lazer korreksiyasi, katarakta, glaukoma, retina operatsiyalari va boshqa ko'z kasalliklarini davolash."
        keywords="ko'z tibbiy xizmatlari, lazer korreksiyasi, katarakta operatsiyasi, glaukoma davolash, retina operatsiyasi, Toshkent"
        canonical="https://koznuri.novacode.uz/services"
        structuredData={structuredData}
      />
      <div>
        <AllHeader title={servicesTitle} link="/services" />
      <div className="max-w-[1380px] mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Services Grid - All services in 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {localizedServices.map((service, index) => (
            <article
              key={service.uuid}
              className="group relative flex flex-col rounded-[33px] bg-white text-[#282828] hover:bg-[#1857FE] hover:text-white p-6 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl animate-[fade-in-up_0.6s_ease-out_forwards] h-full"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
              aria-labelledby={`service-${service.uuid}-title`}
            >
              {/* Service Number */}
              <div className="text-6xl h-[40px] overflow-hidden mb-4 transition-colors duration-300 text-[#1857FE]/20 group-hover:text-white/30">
                {(index + 1).toString().padStart(2, "0")}
              </div>

              {/* Service Title */}
              <h3
                id={`service-${service.uuid}-title`}
                className="font-bold mb-3 text-xl transition-colors duration-300 text-[#282828] group-hover:text-white"
              >
                {service.title}
              </h3>

              {/* Service Subtitle */}
              <p className="mb-4 flex-grow leading-relaxed text-sm transition-colors duration-300 text-[#747474] group-hover:text-white/90">
                {service.subtitle}
              </p>

              {/* Action Link */}
              <Link
                to={`/service/${service.uuid}`}
                className="inline-block mt-auto font-semibold hover:underline transition-all duration-200 text-sm text-[#1857FE] hover:text-white group-hover:text-white/80"
              >
                {t("common.readMore") || "Батафсил"}
              </Link>
            </article>
          ))}
        </div>
      </div>

      {/* YouTube Video Section */}
      <div className="max-w-[1380px] mx-auto px-4 py-8">
        <div className="">
          {/* Main Video */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="relative w-full h-[500px] lg:h-[700px]">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/0mWU1T_pQbw"
                title="Коз Нури клиникаси - Лазер коррекцияси"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-t-xl"
              ></iframe>
            </div>
          </div>
        </div>

        {/* YouTube Channel Button */}
        <div className="text-center mt-8">
          <a
            href="https://www.youtube.com/@koznuri_clinic"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#1857FE] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#0d47e8] transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            {t("common.subscribeYoutube")}
          </a>
        </div>
      </div>

      <Location />
      </div>
    </>
  );
};

export default Servises;
