import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import ServiceImage from '../../assets/servis.svg';
import { usePopularServices } from '../../hooks/useServices';
import LoadingSpinner from '../LoadingSpinner';
import type { Service } from '../../services/servicesService';

const truncateWords = (text: string, maxWords = 20): string => {
  if (!text) return '';
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(' ');
  return `${words.slice(0, maxWords).join(' ')}...`;
};

const Servis = () => {
  const { i18n, t } = useTranslation();
  const { data: services, isLoading, error } = usePopularServices();

  // Map i18n language to API language codes
  const getCurrentLanguageCode = (): string => {
    const lang = i18n.language;
    const langMap: Record<string, string> = {
      'uz': 'uz',
      'uz-cyrillic': 'kr',
      'uz-latin': 'uz',
      'ru': 'ru',
      'en': 'en',
      'kz': 'kz',
      'ky': 'kg',
      'tg': 'tj'
    };
    return langMap[lang] || 'kr';
  };

  // Get localized service content
  const getLocalizedService = (service: Service) => {
    const langCode = getCurrentLanguageCode();
    const titleKey = `title_${langCode}` as keyof Service;
    const subtitleKey = `subtitle_${langCode}` as keyof Service;
    const descriptionKey = `description_${langCode}` as keyof Service;

    const title = service[titleKey] as string || service.title_kr;
    const subtitle = service[subtitleKey] as string || service.subtitle_kr;
    const description = service[descriptionKey] as string || service.description_kr;

    // Remove HTML tags from description
    const cleanDescription = description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    return {
      ...service,
      title,
      subtitle,
      description: cleanDescription,
    };
  };

  // Loading state
  if (isLoading) {
    return (
      <section>
        <div className="w-full max-w-full overflow-x-hidden">
          <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 md:px-8 rounded-[20px] py-10 md:py-14 lg:py-16 bg-[#E9EEFE]">
            <div className="flex justify-center items-center min-h-[240px] md:min-h-[320px] lg:min-h-[400px]">
              <LoadingSpinner />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error || !services || services.length === 0) {
    return (
      <section>
        <div className="w-full max-w-full overflow-x-hidden">
          <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 md:px-8 rounded-[20px] py-10 md:py-14 lg:py-16 bg-[#E9EEFE]">
            <div className="flex justify-center items-center min-h-[240px] md:min-h-[320px] lg:min-h-[400px]">
              <p className="text-red-500 text-base md:text-lg">{t('common.error')}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Display services (max 6 total: 4 in first row, remaining in second row)
  const maxServices = Math.min(services.length, 6);
  const displayedServices = services.slice(0, maxServices).map(getLocalizedService);

  return (
    <section>
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 md:px-8 rounded-[20px] py-10 md:py-14 lg:py-16 bg-[#E9EEFE]">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 md:gap-6 mb-6 md:mb-10 lg:mb-12">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#282828]">
            {t('services.title')}
          </h2>
        
          <NavLink
            to="/services" 
            className="text-[#1857FE] hover:text-blue-700 transition-colors duration-200 pb-1 md:pb-2 border-b text-base md:text-lg font-medium self-start sm:self-auto"
          >
            {t('services.allServices')}
          </NavLink>
        </div>

        {/* Services Grid */}
        <div className="space-y-6">
          {/* First Row - Cards 1-4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {displayedServices.slice(0, 4).map((service, index) => (
              <article
                key={service.uuid}
                className="group relative flex flex-col rounded-[24px] md:rounded-[28px] lg:rounded-[33px] bg-white text-[#282828] hover:bg-[#1857FE] hover:text-white p-5 md:p-6 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
                aria-labelledby={`service-${service.uuid}-title`}
              >
                {/* Content Section - Takes available space */}
                <div className="flex-1 flex flex-col">
                  {/* Service Number */}
                  <div className="text-4xl md:text-5xl lg:text-6xl h-[32px] md:h-[36px] lg:h-[40px] overflow-hidden mb-3 md:mb-4 transition-colors duration-300 text-[#1857FE]/20 group-hover:text-white/30">
                    {(index + 1).toString().padStart(2, '0')}
                  </div>

                  {/* Service Title */}
                  <h3 
                    id={`service-${service.uuid}-title`}
                    className="font-bold mb-2 md:mb-3 text-lg md:text-xl transition-colors duration-300 text-[#282828] group-hover:text-white"
                  >
                    {service.title}
                  </h3>

                  {/* Service Description */}
                  <p className="mb-4 flex-1 leading-relaxed text-sm md:text-[15px] transition-colors duration-300 text-[#747474] group-hover:text-white/90">
                    {truncateWords(service.description)}
                  </p>
                </div>

                {/* Action Link - Always at bottom */}
                <div className="mt-auto pt-2">
                  <NavLink 
                    to={`/service/${service.uuid}`}
                    className="inline-block font-semibold hover:underline transition-all duration-200 text-sm md:text-[15px] text-[#1857FE] hover:text-white group-hover:text-white/80"
                  >
                    {t('services.bookAppointment')}
                  </NavLink>
                </div>

              </article>
            ))}
          </div>

          {/* Second Row - Remaining Cards + Image */}
          {displayedServices.length > 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Remaining service cards */}
              {displayedServices.slice(4).map((service, index) => (
                <article
                  key={service.uuid}
                  className="group relative flex flex-col rounded-[24px] md:rounded-[28px] lg:rounded-[33px] bg-white text-[#282828] hover:bg-[#1857FE] hover:text-white p-5 md:p-6 transition-all duration-300 shadow-lg hover:shadow-xl col-span-1 lg:col-span-2"
                  style={{
                    animationDelay: `${(index + 4) * 0.1}s`
                  }}
                  aria-labelledby={`service-${service.uuid}-title`}
                >
                  {/* Content Section - Takes available space */}
                  <div className="flex-1 flex flex-col">
                    {/* Service Number */}
                    <div className="text-4xl md:text-5xl lg:text-6xl h-[32px] md:h-[36px] lg:h-[40px] overflow-hidden mb-3 md:mb-4 transition-colors duration-300 text-[#1857FE]/20 group-hover:text-white/30">
                      {(index + 5).toString().padStart(2, '0')}
                    </div>

                    {/* Service Title */}
                    <h3 
                      id={`service-${service.uuid}-title`}
                      className="font-bold mb-2 md:mb-3 text-lg md:text-xl transition-colors duration-300 text-[#282828] group-hover:text-white"
                    >
                      {service.title}
                    </h3>

                    {/* Service Description */}
                    <p className="mb-4 flex-1 leading-relaxed text-sm md:text-[15px] transition-colors duration-300 text-[#747474] group-hover:text-white/90">
                      {truncateWords(service.description)}
                    </p>
                  </div>

                  {/* Action Link - Always at bottom */}
                  <div className="mt-auto pt-2">
                    <NavLink 
                      to={`/service/${service.uuid}`}
                      className="inline-block font-semibold hover:underline transition-all duration-200 text-sm md:text-[15px] text-[#1857FE] hover:text-white group-hover:text-white/80"
                    >
                      {t('services.bookAppointment')}
                    </NavLink>
                  </div>

                </article>
              ))}

              {/* Service Image - Shows only if there's 1 remaining service (takes 2 cols) */}
              {displayedServices.slice(4).length === 1 && (
                <div className="lg:col-span-2">
                  <div className="relative rounded-[24px] md:rounded-[28px] lg:rounded-[33px] overflow-hidden shadow-2xl h-48 md:h-64 lg:h-[300px]">
                    <img 
                      src={ServiceImage} 
                      alt="Eye Examination Service" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </section>
  );
};

export default Servis;
