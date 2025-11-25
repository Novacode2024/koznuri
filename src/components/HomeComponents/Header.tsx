import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import { getBanners } from "../../services/bannerService";
import type { Banner } from "../../types/Banner";
import { sanitizeHtml } from "../../utils/sanitize";

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getBanners();
        // Sort by order field
        const sortedBanners = data.sort((a, b) => a.order - b.order);
        setBanners(sortedBanners);
      } catch {
        // Silent fail - banners are optional
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
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
  const getTitle = (banner: Banner): string => {
    const lang = getCurrentLanguage();
    const langKey = `title_${lang}` as keyof Banner;
    const title = banner[langKey] as string;
    return title || banner.title_uz || banner.title_ru || banner.title_en || '';
  };

  // Get subtitle based on current language
  const getSubtitle = (banner: Banner): string => {
    const lang = getCurrentLanguage();
    const langKey = `subtitle_${lang}` as keyof Banner;
    const subtitle = banner[langKey] as string;
    return subtitle || banner.subtitle_uz || banner.subtitle_ru || banner.subtitle_en || '';
  };

  // Get text based on current language with highlighted numbers
  const getText = (banner: Banner): string => {
    const lang = getCurrentLanguage();
    const langKey = `text_${lang}` as keyof Banner;
    const text = banner[langKey] as string;
    const rawText = text || banner.text_uz || banner.text_ru || banner.text_en || '';
    
    // Highlight numbers and percentages in blue
    return rawText.replace(/(\d+%?)/g, '<strong class="text-[#1857FE]">$1</strong>');
  };

  // Get image URL
  const getImageUrl = (banner: Banner): string => {
    if (banner.image) {
      return `https://koznuri.novacode.uz${banner.image}`;
    }
    return "";
   
  };

  // Get default banner if no API data
  const getDefaultBanner = (): Banner => {
    return {
      uuid: 'default',
      title_uz: t("header.title"),
      title_kr: t("header.title"),
      title_ru: t("header.title"),
      title_en: t("header.title"),
      title_tj: t("header.title"),
      title_kz: t("header.title"),
      title_kg: t("header.title"),
      subtitle_uz: t("header.subtitle"),
      subtitle_kr: t("header.subtitle"),
      subtitle_ru: t("header.subtitle"),
      subtitle_en: t("header.subtitle"),
      subtitle_tj: t("header.subtitle"),
      subtitle_kz: t("header.subtitle"),
      subtitle_kg: t("header.subtitle"),
      text_uz: t("header.description"),
      text_kr: t("header.description"),
      text_ru: t("header.description"),
      text_en: t("header.description"),
      text_tj: t("header.description"),
      text_kz: t("header.description"),
      text_kg: t("header.description"),
      order: 0,
      image: ''
    };
  };

  const displayBanners = banners.length > 0 ? banners : [getDefaultBanner()];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        delay: 0.2,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.4,
      },
    },
  };

  const buttonsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: 0.6,
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9, x: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.8,
        delay: 0.3,
      },
    },
  };

  if (loading) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          <div className="space-y-4 md:space-y-6">
            <div className="h-16 md:h-24 lg:h-32 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-xl"></div>
            <div className="h-12 md:h-16 lg:h-24 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-xl"></div>
            <div className="h-10 md:h-12 lg:h-16 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-xl"></div>
          </div>
          <div className="h-64 md:h-96 lg:h-[550px] bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-3xl"></div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <motion.div 
        className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
      <Swiper
        modules={[Autoplay]}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        loop={displayBanners.length > 1}
        spaceBetween={0}
        slidesPerView={1}
        className="header-swiper"
      >
        {displayBanners.map((banner) => (
          <SwiperSlide key={banner.uuid}>
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10 items-start lg:items-stretch"
              key={banner.uuid}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {/* Left Section - Text and Call-to-Action */}
                <motion.div 
                className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7 p-4 md:p-10 relative z-10 w-full"
                variants={itemVariants}
              >
                {/* Title */}
                <motion.div 
                  className="space-y-2 md:space-y-3"
                  variants={containerVariants}
                >
                  <motion.h1 
                    className="text-[#1857FE] font-extrabold leading-tight text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tight break-words"
                    variants={titleVariants}
                  >
                    <span className="bg-gradient-to-r from-[#1857FE] to-[#0d47e8] bg-clip-text text-transparent">
                      {getTitle(banner)}
                    </span>
                  </motion.h1>

                  {/* Tagline */}
                  <motion.h2 
                    className="text-gray-900 font-bold leading-tight text-lg md:text-xl lg:text-2xl xl:text-3xl break-words"
                    variants={subtitleVariants}
                  >
                    {getSubtitle(banner)}
                  </motion.h2>
                </motion.div>

                {/* Description with highlighted numbers */}
                <motion.div 
                  className="text-gray-600 leading-relaxed text-sm md:text-base lg:text-lg max-w-full break-words"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(getText(banner)) }}
                  variants={textVariants}
                />

                {/* Action Buttons */}
                <motion.div 
                  className="flex items-center gap-3 md:gap-4 flex-wrap pt-1"
                  variants={buttonsVariants}
                >
                  {/* Primary Button */}
                  <motion.button
                    className="group relative bg-gradient-to-r from-[#1857FE] to-[#0d47e8] text-white font-semibold hover:from-[#0d47e8] hover:to-[#1857FE] transition-all duration-300 flex items-center justify-center rounded-[5px] px-6 py-3 md:px-7 md:py-3.5 text-sm md:text-base shadow-lg hover:shadow-xl hover:scale-105 transform cursor-pointer"
                    onClick={() => navigate("/about")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {t("common.readMore")}
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 rounded-xl bg-[#1857FE] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </motion.button>

                  {/* Secondary Action - Video Play */}
                  {banner.video && (
                    <motion.a
                      href={banner.video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 cursor-pointer group no-underline"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div 
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-[#1857FE] via-[#96B6FC] to-[#96E4FC] shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300"
                        whileHover={{ 
                          scale: 1.1,
                          boxShadow: "0 20px 25px -5px rgba(24, 87, 254, 0.3), 0 10px 10px -5px rgba(24, 87, 254, 0.2)"
                        }}
                      >
                        <svg
                          className="w-5 h-5 md:w-6 md:h-6 text-white ml-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </motion.div>
                      <span className="text-sm md:text-base text-gray-700 font-semibold group-hover:text-[#1857FE] transition-colors duration-300 whitespace-nowrap">
                        {t("header.watchVideo")}
                      </span>
                    </motion.a>
                  )}
                </motion.div>
              </motion.div>

              {/* Right Section - Image */}
              <motion.div 
                className="relative flex justify-center p-4 md:p-10 lg:justify-end mt-8 lg:mt-0 w-full lg:h-full"
                variants={imageVariants}
              >
                <motion.div 
                  className="relative w-full min-h-[18rem] lg:min-h-0 lg:h-full rounded-3xl overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={getImageUrl(banner)}
                    alt={getTitle(banner)}
                    className="w-full h-full object-cover rounded-3xl"
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
      </motion.div>
    </div>
  );
};

export default Header;
