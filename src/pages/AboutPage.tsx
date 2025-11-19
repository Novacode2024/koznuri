import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from "react-i18next";
import { getAbout } from '../services/aboutService';
import type { About } from '../types/About';
import AllHeader from '../components/AllHeader';
import Status from '../components/HomeComponents/Status';
import Contact from '../components/HomeComponents/Contact';
import Messages from '../components/HomeComponents/Messages';
import Location from '../components/HomeComponents/Location';
import SEO from '../components/SEO';
import { sanitizeHtml } from '../utils/sanitize';
import { mapI18nToApiLanguage } from '../utils/languageMapper';

const AboutPage = () => {
  const { t, i18n } = useTranslation();
  const [aboutData, setAboutData] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        setLoading(true);
        const data = await getAbout();
        setAboutData(data);
      } catch {
        setError(t('about.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, [t]);

  // Map i18n language to API language codes
  const getCurrentLanguage = (): string => {
    return mapI18nToApiLanguage(i18n.language);
  };

  // Get title based on current language
  const getTitle = (): string => {
    if (!aboutData) return t('common.about');
    const lang = getCurrentLanguage();
    const langKey = `title_${lang}` as keyof About;
    const title = aboutData[langKey] as string;
    
    // Fallback to other languages if current language not available
    return title || aboutData.title_uz || aboutData.title_ru || aboutData.title_en || t('common.about');
  };

  // Get description based on current language
  const getDescription = (): string => {
    if (!aboutData) return '';
    const lang = getCurrentLanguage();
    const langKey = `description_${lang}` as keyof About;
    const description = aboutData[langKey] as string;
    
    // Fallback to other languages if current language not available
    const rawDescription = description || aboutData.description_uz || aboutData.description_ru || aboutData.description_en || aboutData.description_tj || aboutData.description_kz || aboutData.description_kg || '';
    
    // Clean up HTML tags and attributes for better display
    return cleanHtmlContent(rawDescription);
  };

  // Clean HTML content by removing problematic attributes and fixing tags
  const cleanHtmlContent = (html: string): string => {
    if (!html) return '';
    
    return html
      // Remove data attributes
      .replace(/\s*data-[^=]*="[^"]*"/g, '')
      // Fix broken HTML tags
      .replace(/<п>/g, '<p>')
      .replace(/<\/п>/g, '</p>')
      .replace(/<стронг>/g, '<strong>')
      .replace(/<\/стронг>/g, '</strong>')
      .replace(/<бр>/g, '<br>')
      .replace(/<\/бр>/g, '')
      // Clean up extra spaces and line breaks
      .replace(/\s+/g, ' ')
      .replace(/\r\n/g, '<br>')
      .replace(/\n/g, '<br>')
      .trim();
  };

  // Move useMemo before early returns to follow Rules of Hooks
  const structuredData = useMemo(() => {
    if (!aboutData) return null;
    return {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": getTitle(),
      "description": getDescription().substring(0, 200),
      "url": "https://koznuri.novacode.uz/about",
      "mainEntity": {
        "@type": "MedicalOrganization",
        "name": "Ko'z Nuri - Eye Medical Center",
        "url": "https://koznuri.novacode.uz"
      }
    };
  }, [aboutData, i18n.language, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-[1380px] mx-auto px-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">{t('about.loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-[1380px] mx-auto px-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-red-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-[1380px] mx-auto px-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">{t('about.noData')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {aboutData && (
        <SEO
          title={`${t('common.about')} | Ko'z Nuri`}
          description={getDescription().substring(0, 160)}
          keywords="ko'z tibbiy markazi haqida, Ko'z Nuri klinikasi, oftalmologiya markazi, Toshkent, O'zbekiston"
          image={aboutData.image ? `https://koznuri.novacode.uz${aboutData.image}` : undefined}
          canonical="https://koznuri.novacode.uz/about"
          structuredData={structuredData}
        />
      )}
      <div className="min-h-screen bg-white py-8 sm:py-12 md:py-16">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6">
         <AllHeader title={t('common.about')} link="/about" />
        {/* Main Content Section - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-start my-10 sm:my-14 md:my-20 lg:my-[146px]">
          {/* Left Column - Text Content (50% width) */}
          <div className="lg:col-span-1">
            {/* Main Title */}
            <h1 className="text-[22px] sm:text-[26px] md:text-[30px] lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8">
              {getTitle()}
            </h1>
            
            {/* Description */}
            <div className="text-[14px] sm:text-[15px] md:text-[16px] text-gray-600 leading-relaxed mb-6 sm:mb-8 md:mb-12">
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(getDescription()) }} />
            </div>
          </div>

          {/* Right Column - Image (50% width) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              {/* Image Section */}
              {aboutData.image && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <img
                    src={`https://koznuri.novacode.uz${aboutData.image}`}
                    alt={getTitle()}
                    className="w-full h-auto max-h-[300px] sm:max-h-[380px] md:max-h-[480px] lg:max-h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <Status />
        <Contact />
        <div className='my-10 sm:my-14 md:my-20 lg:my-[146px]'>
        <Messages />
        </div>
        <Location />
      </div>
      </div>
    </>
  );
};

export default AboutPage;