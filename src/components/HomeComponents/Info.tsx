import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { getAbout } from '../../services/aboutService';
import type { About } from '../../types/About';
import { useNavigate } from 'react-router-dom';
import { sanitizeHtml } from '../../utils/sanitize';

// Style constants for clean code
const titleStyle = {
  fontWeight: 750 as const,
  letterSpacing: '0%' as const,
};

const textStyle = {
  letterSpacing: '0%' as const,
};

const buttonStyle = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 600 as const,
  letterSpacing: '0%' as const,
};



const imageContainerStyle = {
  borderRadius: '20px',
  opacity: 1,
};

const Info = () => {
  const { t, i18n } = useTranslation();
  const [aboutData, setAboutData] = useState<About | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const data = await getAbout();
        setAboutData(data);
      } catch {
        // Silent fail - about data is optional
      }
    };

    fetchAbout();
  }, []);

  // Map i18n language to API language codes
  const getCurrentLanguage = (): string => {
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
    return langMap[lang] || 'uz';
  };

  // Get title based on current language
  const getTitle = (): string => {
    if (!aboutData) return t("info.title");
    const lang = getCurrentLanguage();
    const langKey = `title_${lang}` as keyof About;
    const title = aboutData[langKey] as string;
    return title || aboutData.title_uz || aboutData.title_ru || aboutData.title_en || t("info.title");
  };

  // Get description based on current language
  const getDescription = (): string => {
    if (!aboutData) return t("info.description");
    const lang = getCurrentLanguage();
    const langKey = `description_${lang}` as keyof About;
    const description = aboutData[langKey] as string;
    const rawDescription = description || aboutData.description_uz || aboutData.description_ru || aboutData.description_en || t("info.description");
    return cleanHtmlContent(rawDescription);
  };

  // Clean HTML content by removing problematic attributes and fixing tags
  const cleanHtmlContent = (html: string): string => {
    if (!html) return '';
    return html
      .replace(/\s*data-[^=]*="[^"]*"/g, '')
      .replace(/<п>/g, '<p>')
      .replace(/<\/п>/g, '</p>')
      .replace(/<стронг>/g, '<strong>')
      .replace(/<\/стронг>/g, '</strong>')
      .replace(/<бр>/g, '<br>')
      .replace(/<\/бр>/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\r\n/g, '<br>')
      .replace(/\n/g, '<br>')
      .trim();
  };

  // Get image from API or fallback to default
  const getImage = (): string => {
    if (aboutData?.image) {
      return `https://koznuri.novacode.uz${aboutData.image}`;
    }
    return "";

  };

  return (
    <section className="py-10 md:py-14 lg:py-12 xl:py-14 2xl:py-16">
      <div className="w-full max-w-full">
        <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-6 xl:gap-8 2xl:gap-12 lg:items-center">
            {/* Text Content Section (Second on mobile, first on desktop) */}
            <div className="space-y-3 lg:space-y-3 xl:space-y-4 2xl:space-y-4 flex flex-col justify-center order-2 lg:order-1">
              {/* Main Title */}
              <div className="space-y-1 lg:space-y-1.5 xl:space-y-2">
                <h2 
                  className="text-[#282828] font-bold leading-tight text-3xl md:text-4xl lg:text-[32px] lg:leading-[40px] xl:text-[38px] xl:leading-[46px] 2xl:text-[48px] 2xl:leading-[56px]"
                  style={titleStyle}
                >
                  {getTitle()}
                </h2>
              </div>

              {/* Description Paragraph */}
              <div 
                className="text-[#747474] leading-relaxed text-base md:text-[18px] md:leading-7 lg:text-sm lg:leading-6 xl:text-base xl:leading-7 2xl:text-[18px] 2xl:leading-7"
                style={textStyle}
              >
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(getDescription()) }} />
              </div>

              {/* Details Button */}
              <div className="pt-2 lg:pt-2 xl:pt-3 2xl:pt-4">
                <button 
                  onClick={() => navigate('/about')}
                  className="bg-[#1857FE] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 px-5 py-2.5 md:px-8 md:py-4 lg:px-5 lg:py-2.5 xl:px-6 xl:py-3 2xl:px-8 2xl:py-4 text-xs md:text-base lg:text-xs xl:text-sm 2xl:text-base cursor-pointer"
                  style={buttonStyle}
                >
                  {t("info.detailsButton")}
                </button>
              </div>
            </div>

            {/* Image Section (First on mobile, second on desktop) */}
            <div className="w-full order-1 lg:order-2">
              <div className="w-full max-w-full lg:max-w-[809px] mx-auto">
                {/* Main Image */}
                <div 
                  className="rounded-[20px] overflow-hidden w-full"
                  style={imageContainerStyle}
                >
                  <img 
                    src={getImage()} 
                    alt={getTitle()} 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Info;
