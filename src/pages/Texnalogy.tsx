import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import AllHeader from "../components/AllHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import SEO from "../components/SEO";
import { useTechnologies } from "../hooks/useTechnologies";
import { localizeTechnology, type TechnologyLocale } from "../services/technologiesService";
import { sanitizeHtml } from "../utils/sanitize";

const TechnologyCard: React.FC<{ item: { uuid: string; title: string; description: string; image: string; order: number } }> = ({ item }) => {
  // Helper function to get image URL
  const getImageUrl = (image: string): string => {
    if (image.startsWith("http")) return image;
    return `https://koznuri.novacode.uz${image}`;
  };

  // Extract category from title (simple extraction - can be improved)
  const category = item.title.includes("Диагностика") || item.title.includes("Diagnostic") || 
                   item.title.includes("Oculyzer") || item.title.includes("OCT") || 
                   item.title.includes("Авторефрактометр") || item.title.includes("Avtorefraktometr") || 
                   item.title.includes("Тонометр") || item.title.includes("Tonometer") 
                   ? "Диагностика" : "Хирургия";

  return (
    <div className="overflow-hidden mb-8">
      <div className="flex flex-col lg:flex-row">
        {/* Left Column - Image */}
        <div className="lg:w-1/2 lg:sticky lg:top-0 lg:self-start">
          <div className="p-6">
            <div className="relative">
              <img 
                src={getImageUrl(item.image)} 
                alt={item.title}
                className="w-full h-[400px] lg:h-[500px] object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/600x400";
                }}
              />
              <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded-md font-medium text-sm">
                {category}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:w-1/2 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 leading-tight">
            {item.title}
          </h2>
          
          <div 
            className="text-gray-700 mb-6 leading-relaxed whitespace-pre-line prose max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description) }}
          />
        </div>
      </div>
    </div>
  );
};

const Technology = () => {
  const { t, i18n } = useTranslation();
  const { data: technologies, isLoading, error } = useTechnologies();

  // Map i18next language to technology locale
  const technologyLocale = useMemo((): TechnologyLocale => {
    const lang = i18n.language;
    const localeMap: Record<string, TechnologyLocale> = {
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

  // Localize all technologies based on current language
  const localizedTechnologies = useMemo(() => {
    if (!technologies) return [];
    return technologies
      .map((tech) => localizeTechnology(tech, technologyLocale))
      .sort((a, b) => a.order - b.order);
  }, [technologies, technologyLocale]);

  // Move useMemo before early returns to follow Rules of Hooks
  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": t("common.technology") || "Техника",
    "description": "Ko'z Nuri klinikasi - O'zbekistondagi eng zamonaviy ko'z diagnostika va jarrohlik texnologiyalari. Oculyzer, OCT, Avtorefraktometr va boshqa zamonaviy asboblar.",
    "url": "https://koznuri.novacode.uz/technologies",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": localizedTechnologies.length,
      "itemListElement": localizedTechnologies.map((tech, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "MedicalDevice",
          "name": tech.title,
          "description": tech.description.substring(0, 100)
        }
      }))
    }
  }), [localizedTechnologies, t]);

  // Loading state
  if (isLoading) {
    return (
      <>
        <AllHeader title={t("common.technology") || "Техника"} link="/technologies" />
        <div className="max-w-[1380px] mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" text={t("common.loading")} />
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error || !localizedTechnologies || localizedTechnologies.length === 0) {
    return (
      <>
        <AllHeader title={t("common.technology") || "Техника"} link="/technologies" />
        <div className="max-w-[1380px] mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {t("common.errorOccurred") || "Хатолик юз берди"}
            </h3>
            <p className="text-sm text-gray-500">
              {error?.message || t("common.noDataAvailable") || "Маълумотлар мавжуд эмас"}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${t("common.technology") || "Техника"} | Ko'z Nuri`}
        description="Ko'z Nuri klinikasi - O'zbekistondagi eng zamonaviy ko'z diagnostika va jarrohlik texnologiyalari. Oculyzer, OCT, Avtorefraktometr va boshqa zamonaviy asboblar."
        keywords="ko'z diagnostika texnologiyalari, Oculyzer, OCT, Avtorefraktometr, ko'z tibbiy asboblari, Toshkent"
        canonical="https://koznuri.novacode.uz/technologies"
        structuredData={structuredData}
      />
      <AllHeader title={t("common.technology") || "Техника"} link="/technologies" />
      <div className="max-w-[1380px] mx-auto px-4 py-8">
        <div className="space-y-8">
          {localizedTechnologies.map((item) => (
            <TechnologyCard key={item.uuid} item={item} />
          ))}
        </div>


      </div>
    </>
  );
};

export default Technology;
