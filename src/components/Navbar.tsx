import LogoIcon from "../assets/icons/logo.svg";

import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { servicesService, type Service } from "../services/servicesService";
import NavbarMenuRes from "./NavbarMenuRes";
import ChatWidget from "./ChatWidget";
import { useCompanyAddresses } from "../hooks/useCompanyAddresses";
import { useCompanyInfo } from "../hooks/useCompanyInfo";
import AppointmentFormModal from "./AppointmentFormModal";
import InterestModal from "./InterestModal";
import type { CompanyAddress } from "../services/companyAddressesService";
// Animation variants for clean code organization
const animationVariants = {
  // Container animations
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },
  
  // Item animations
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.6, -0.05, 0.01, 0.99] as const,
      },
    },
  },
  
  fadeInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.6, -0.05, 0.01, 0.99] as const,
      },
    },
  },
  
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.6, -0.05, 0.01, 0.99] as const,
      },
    },
  },
  
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.6, -0.05, 0.01, 0.99] as const,
      },
    },
  },
  
  slideInRight: {
    hidden: { x: "100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "tween" as const,
        duration: 0.3,
        ease: [0.6, -0.05, 0.01, 0.99] as const,
      },
    },
    exit: {
      x: "100%",
      opacity: 0,
      transition: {
        type: "tween" as const,
        duration: 0.25,
        ease: [0.6, 0.05, 0.01, 0.99] as const,
      },
    },
  },
  
  slideInFromTop: {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.6, -0.05, 0.01, 0.99] as const,
      },
    },
  },
  
  // Hover animations
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.6, -0.05, 0.01, 0.99] as const,
    },
  },
  
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

// Common transition configs
const transitionConfigs = {
  smooth: {
    duration: 0.3,
    ease: [0.6, -0.05, 0.01, 0.99] as const,
  },
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
  },
  quick: {
    duration: 0.2,
    ease: [0.6, -0.05, 0.01, 0.99] as const,
  },
};

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const { data: companyInfo } = useCompanyInfo();
  const { data: companyAddresses } = useCompanyAddresses();
  // unified icon button styles for mobile
  const iconBtnBase = "rounded-full bg-[#1857FE] text-white flex items-center justify-center border border-[#1857FE]/30 shadow-[0_9px_27px_0_#1857FEAD]";
  const iconBtnMobile = `${iconBtnBase} w-10 h-10`;

  // Check authentication status
  const checkAuth = () => {
    const token = localStorage.getItem("auth_token");
    return !!token;
  };

  useEffect(() => {
    if (!isSearchOpen) return;
    servicesService
      .getServices()
      .then(setServices)
      .catch(() => {});
  }, [isSearchOpen]);

  // Auto-open interest modal after 3 seconds (every time page loads/refreshes)
  useEffect(() => {
    // Set timeout to open modal after 3 seconds (3000 milliseconds)
    // This will run every time the component mounts (including page refresh)
    const timer = setTimeout(() => {
      setIsInterestModalOpen(true);
    }, 10000); // 3 seconds (test mode - change to 30000 for 30 seconds in production)

    // Cleanup timer on unmount
    return () => {
      clearTimeout(timer);
    };
  }, []); // Run on every component mount (page load/refresh)

  // Map i18n language to API language codes
  const currentLang = useMemo(() => {
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
  }, [i18n.language]);

  // Get working hours from company info
  const workTimeDisplay = useMemo(() => {
    if (companyInfo?.start_time && companyInfo?.end_time) {
      const formatTime = (time: string) =>
        time.length >= 5 ? time.slice(0, 5) : time;
      const start = formatTime(companyInfo.start_time);
      const end = formatTime(companyInfo.end_time);
      return { time: `${start} - ${end}` };
    }

    // Fallback to translation
    return { time: t('common.workSchedule') };
  }, [companyInfo, t]);

  // Get first address for display
  const firstAddress = useMemo(() => {
    if (!companyAddresses || !Array.isArray(companyAddresses) || companyAddresses.length === 0) {
      return null;
    }
    return companyAddresses[0] || null;
  }, [companyAddresses]);

  const phoneInfo = useMemo(() => {
    const fallbackDisplay = "+998 55 514 03 33";
    const fallbackTel = "+998555140333";
    const rawPhone = companyInfo?.phone?.trim();

    if (!rawPhone) {
      return { display: fallbackDisplay, tel: fallbackTel };
    }

    const tel = rawPhone.startsWith("+")
      ? rawPhone.replace(/\s+/g, "")
      : `+${rawPhone.replace(/\s+/g, "")}`;

    return {
      display: rawPhone,
      tel,
    };
  }, [companyInfo]);

  // Get title based on current language
  const getTitle = (address: CompanyAddress | null): string => {
    if (!address) return t('common.address');
    const titleLangKey = `title_${currentLang}` as keyof CompanyAddress;
    return (address[titleLangKey] as string) || address.title_uz || address.title_kr || '';
  };

  // Get address based on current language
  const getAddress = (address: CompanyAddress | null): string => {
    if (!address) return t('common.fullAddress');
    const addressLangKey = `address_${currentLang}` as keyof CompanyAddress;
    return (address[addressLangKey] as string) || address.address_uz || address.address_ru || address.address_en || '';
  };

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return [] as Service[];
    const q = searchQuery.toLowerCase();
    return services.filter((s) => {
      const fields = [
        s.title_uz,
        s.title_kr,
        s.title_ru,
        s.title_en,
        s.title_tj,
        s.title_kz,
        s.title_kg,
        s.subtitle_uz,
        s.subtitle_kr,
        s.subtitle_ru,
        s.subtitle_en,
        s.subtitle_tj,
        s.subtitle_kz,
        s.subtitle_kg,
      ].filter(Boolean) as string[];
      return fields.some((f) => f.toLowerCase().includes(q));
    });
  }, [services, searchQuery]);

  return (
    <>
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Interest Modal Button - Above ChatWidget */}
        <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-4 z-40">
          {/* Glow effect wrapper */}
          <motion.div
            className="absolute inset-0 rounded-full bg-[#1857FE] opacity-75 blur-xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Pulse ring effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#1857FE]"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.button
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{
              scale: [1, 1.1, 1],
              rotate: 0,
              opacity: 1,
            }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => {
              setIsInterestModalOpen(true);
            }}
            className="relative bg-[#1857FE] text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shadow-2xl hover:bg-[#0d47e8] active:bg-[#0a3dd4] transition-colors cursor-pointer touch-manipulation border-2 border-white/20"
            whileHover={{
              scale: 1.15,
              boxShadow: "0 0 30px rgba(24, 87, 254, 0.6)",
            }}
            whileTap={{ scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              scale: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            aria-label={t("common.showInterest")}
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </motion.div>
          </motion.button>
        </div>
        <ChatWidget />
        {/* Desktop Header - Redesigned */}
        <div className="hidden lg:block">
          {/* Top Section */}
          <motion.div
            className="flex items-center justify-between mb-6"
            initial="hidden"
            animate="visible"
            variants={animationVariants.container}
          >
            {/* Logo */}
            <motion.div variants={animationVariants.fadeIn}>
              <NavLink to="/" className="flex-shrink-0 block">
                <motion.img
                  src={LogoIcon}
                  alt="Ko'z Nuri Logo"
                  className="h-16 lg:h-20 xl:h-28 w-auto object-contain"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={transitionConfigs.smooth}
                />
              </NavLink>
            </motion.div>

            {/* Contact Info Cards */}
            <motion.div
              className="flex items-center gap-1.5 lg:gap-2 xl:gap-3 2xl:gap-6 flex-1 justify-center flex-nowrap min-w-0"
              variants={animationVariants.container}
            >
              {/* Address Card */}
              <motion.div
                className="flex items-center gap-1.5 lg:gap-2 xl:gap-3 group min-w-0"
                variants={animationVariants.fadeInUp}
              >
                <motion.div
                  className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-gradient-to-br from-[#1857FE] to-[#0d47e8] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
                  whileHover={animationVariants.hover}
                  whileTap={animationVariants.tap}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5" viewBox="0 0 24 24" fill="none">
                    <g clipPath="url(#clip0_location)">
                      <path fillRule="evenodd" clipRule="evenodd" d="M15.75 10.5C15.75 11.4946 15.3549 12.4484 14.6517 13.1517C13.9484 13.8549 12.9946 14.25 12 14.25C11.0054 14.25 10.0516 13.8549 9.34835 13.1517C8.64509 12.4484 8.25 11.4946 8.25 10.5C8.25 9.50544 8.64509 8.55161 9.34835 7.84835C10.0516 7.14509 11.0054 6.75 12 6.75C12.9946 6.75 13.9484 7.14509 14.6517 7.84835C15.3549 8.55161 15.75 9.50544 15.75 10.5ZM14.25 10.5C14.2498 11.0969 14.0125 11.6693 13.5902 12.0913C13.168 12.5133 12.5954 12.7502 11.9985 12.75C11.4016 12.7498 10.8292 12.5125 10.4072 12.0902C9.98524 11.668 9.7483 11.0954 9.7485 10.4985C9.7487 9.90156 9.98602 9.32916 10.4083 8.9072C10.8305 8.48524 11.4031 8.2483 12 8.2485C12.5969 8.2487 13.1693 8.48602 13.5913 8.90826C14.0133 9.3305 14.2502 9.90306 14.25 10.5Z" fill="white"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M21 10.5C21 17.25 13.5 24 12 24C10.5 24 3 17.25 3 10.5C3 5.535 7.035 1.5 12 1.5C16.965 1.5 21 5.535 21 10.5ZM19.5 10.5C19.5 13.365 17.88 16.41 15.9 18.84C14.9295 20.031 13.92 21.015 13.095 21.675C12.7515 21.9588 12.3847 22.2132 11.9985 22.4355L11.9205 22.3935C11.5629 22.1801 11.2219 21.9399 10.9005 21.675C10.0725 21.006 9.0705 20.025 8.0955 18.84C6.1155 16.41 4.4955 13.365 4.4955 10.5C4.4955 6.36 7.8555 3 11.9955 3C16.1355 3 19.4955 6.36 19.4955 10.5H19.5Z" fill="white"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_location">
                        <rect width="24" height="24" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                </motion.div>
                <div className="min-w-0 flex flex-col justify-center">
                  <h3 className="text-xs lg:text-sm xl:text-base font-bold text-gray-900 mb-0.5 lg:mb-1 truncate">{getTitle(firstAddress)}</h3>
                  {firstAddress && firstAddress.map_embed && firstAddress.map_embed !== '' && firstAddress.map_embed !== '#' ? (
                    <a
                      href={firstAddress.map_embed}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] lg:text-xs xl:text-sm text-gray-600 w-[250px] leading-tight lg:leading-relaxed mb-0.5 lg:mb-1 line-clamp-2 hover:text-[#1857FE] transition-colors"
                    >
                      {getAddress(firstAddress)}
                    </a>
                  ) : firstAddress ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getAddress(firstAddress))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] lg:text-xs xl:text-sm text-gray-600 w-[250px] leading-tight lg:leading-relaxed mb-0.5 lg:mb-1 line-clamp-2 hover:text-[#1857FE] transition-colors"
                    >
                      {getAddress(firstAddress)}
                    </a>
                  ) : (
                    <p className="text-[10px] lg:text-xs xl:text-sm text-gray-600 w-[250px] leading-tight lg:leading-relaxed mb-0.5 lg:mb-1 line-clamp-2">
                      {getAddress(firstAddress)}
                    </p>
                  )}
                  {firstAddress && firstAddress.map_embed && firstAddress.map_embed !== '' && firstAddress.map_embed !== '#' && (
                    <a
                      href={firstAddress.map_embed}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] lg:text-xs xl:text-sm font-medium text-[#1857FE] hover:text-[#0d47e8] transition-colors inline-flex items-center gap-0.5 lg:gap-1 whitespace-nowrap"
                    >
                      {t("common.viewOnMap")}
                      <svg className="w-3 h-3 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}
                </div>
              </motion.div>

              {/* Working Hours Card */}
              <motion.div
                className="flex items-center gap-1.5 lg:gap-2 xl:gap-3 group min-w-0"
                variants={animationVariants.fadeInUp}
              >
                <motion.div
                  className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-gradient-to-br from-[#1857FE] to-[#0d47e8] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
                  whileHover={animationVariants.hover}
                  whileTap={animationVariants.tap}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5" viewBox="0 0 24 24" fill="none">
                    <g clipPath="url(#clip0_time)">
                      <path d="M11.9813 0.0481567C18.2933 0.0481567 23.4099 5.37792 23.4099 11.9529C23.4099 18.5279 18.2933 23.8577 11.9813 23.8577C5.66931 23.8577 0.552734 18.5279 0.552734 11.9529C0.552734 5.37792 5.66931 0.0481567 11.9813 0.0481567Z" fill="white"/>
                      <path d="M11.9813 4.81006C12.2612 4.8101 12.5314 4.91715 12.7406 5.11091C12.9498 5.30467 13.0834 5.57167 13.1162 5.86125L13.1242 6.00054V11.4601L16.2179 14.6827C16.4228 14.8969 16.5418 15.1844 16.5507 15.4867C16.5596 15.789 16.4576 16.0835 16.2656 16.3104C16.0736 16.5373 15.8058 16.6795 15.5168 16.7082C15.2277 16.7368 14.939 16.6498 14.7093 16.4648L14.6019 16.366L11.1733 12.7946C10.9957 12.6094 10.8816 12.3684 10.8487 12.1089L10.8384 11.9529V6.00054C10.8384 5.6848 10.9589 5.382 11.1732 5.15874C11.3875 4.93549 11.6782 4.81006 11.9813 4.81006Z" fill="#1857FE"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_time">
                        <rect width="24" height="24" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                </motion.div>
                <div className="min-w-0 flex flex-col justify-center">
                  <h3 className="text-xs lg:text-sm xl:text-base font-bold text-gray-900 mb-0.5 lg:mb-1 truncate">{t("common.workingHours")}</h3>
                  <p className="text-[10px] lg:text-xs xl:text-sm text-gray-600 leading-tight lg:leading-relaxed line-clamp-2">
                    {workTimeDisplay.time}
                  </p>
                </div>
              </motion.div>

              {/* Phone Card */}
              <motion.div
                className="flex items-center gap-1.5 lg:gap-2 xl:gap-3 group min-w-0"
                variants={animationVariants.fadeInUp}
              >
                <motion.div
                  className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-gradient-to-br from-[#1857FE] to-[#0d47e8] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
                  whileHover={animationVariants.hover}
                  whileTap={animationVariants.tap}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5" viewBox="0 0 24 22" fill="none">
                    <g clipPath="url(#clip0_phone)">
                      <path fillRule="evenodd" clipRule="evenodd" d="M3.67564 1.25455C5.06649 -0.1465 7.35678 0.102447 8.52135 1.6795L9.96364 3.62939C10.9122 4.91234 10.8276 6.70476 9.70192 7.83834L9.42992 8.11392C9.39908 8.2296 9.39594 8.35108 9.42078 8.46824C9.49278 8.94066 9.88249 9.94108 11.5145 11.5853C13.1465 13.2295 14.1408 13.6232 14.6139 13.6973C14.7331 13.7216 14.8563 13.718 14.9739 13.6869L15.4402 13.2168C16.4414 12.2094 17.9774 12.0207 19.2162 12.7027L21.3991 13.9069C23.2699 14.9351 23.7419 17.5102 22.2105 19.0537L20.5865 20.6887C20.0745 21.2039 19.3865 21.6335 18.5476 21.7134C16.4791 21.9091 11.6596 21.659 6.59335 16.5561C1.86535 11.7926 0.957921 7.63803 0.842493 5.59087C0.78535 4.55571 1.26764 3.68034 1.88249 3.06203L3.67564 1.25455Z" fill="white"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_phone">
                        <rect width="24" height="22" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                </motion.div>
                <div className="min-w-0 flex flex-col justify-center">
                  <h3 className="text-xs lg:text-sm xl:text-base font-bold text-gray-900 mb-0.5 lg:mb-1 truncate">{t("common.callCenter")}</h3>
                  <a href={`tel:${phoneInfo.tel}`} className="text-[10px] lg:text-xs xl:text-sm font-semibold text-[#1857FE] hover:text-[#0d47e8] transition-colors whitespace-nowrap">
                    {phoneInfo.display}
                  </a>
                </div>
              </motion.div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex items-center gap-2 lg:gap-3 xl:gap-4 flex-shrink-0"
              variants={animationVariants.fadeIn}
            >
              <motion.button
                className="bg-gradient-to-r from-[#1857FE] to-[#0d47e8] hover:from-[#0d47e8] hover:to-[#1857FE] text-white rounded-lg lg:rounded-xl px-3 py-2 lg:px-4 lg:py-2.5 xl:px-6 xl:py-3 flex items-center gap-1.5 lg:gap-2 xl:gap-3 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-xs lg:text-sm xl:text-base"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(24, 87, 254, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                transition={transitionConfigs.spring}
                onClick={() => setIsAppointmentModalOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" viewBox="0 0 46 46" fill="none">
                  <path d="M36.4167 11.5H9.58333C7.46624 11.5 5.75 13.2162 5.75 15.3333V36.4167C5.75 38.5338 7.46624 40.25 9.58333 40.25H36.4167C38.5338 40.25 40.25 38.5338 40.25 36.4167V15.3333C40.25 13.2162 38.5338 11.5 36.4167 11.5Z" stroke="currentColor" strokeWidth="1.91667"/>
                  <path d="M5.75 19.1667C5.75 15.5518 5.75 13.7463 6.87317 12.6232C7.99633 11.5 9.80183 11.5 13.4167 11.5H32.5833C36.1982 11.5 38.0037 11.5 39.1268 12.6232C40.25 13.7463 40.25 15.5518 40.25 19.1667H5.75Z" fill="currentColor"/>
                  <path d="M13.417 5.75V11.5M32.5837 5.75V11.5" stroke="currentColor" strokeWidth="1.91667" strokeLinecap="round"/>
                  <path d="M20.1253 23H14.3753C13.8461 23 13.417 23.4291 13.417 23.9583V25.875C13.417 26.4043 13.8461 26.8333 14.3753 26.8333H20.1253C20.6546 26.8333 21.0837 26.4043 21.0837 25.875V23.9583C21.0837 23.4291 20.6546 23 20.1253 23Z" fill="currentColor"/>
                  <path d="M20.1253 30.6667H14.3753C13.8461 30.6667 13.417 31.0957 13.417 31.625V33.5417C13.417 34.071 13.8461 34.5 14.3753 34.5H20.1253C20.6546 34.5 21.0837 34.071 21.0837 33.5417V31.625C21.0837 31.0957 20.6546 30.6667 20.1253 30.6667Z" fill="currentColor"/>
                  <path d="M31.6253 23H25.8753C25.3461 23 24.917 23.4291 24.917 23.9583V25.875C24.917 26.4043 25.3461 26.8333 25.8753 26.8333H31.6253C32.1546 26.8333 32.5837 26.4043 32.5837 25.875V23.9583C32.5837 23.4291 32.1546 23 31.6253 23Z" fill="currentColor"/>
                  <path d="M31.6253 30.6667H25.8753C25.3461 30.6667 24.917 31.0957 24.917 31.625V33.5417C24.917 34.071 25.3461 34.5 25.8753 34.5H31.6253C32.1546 34.5 32.5837 34.071 32.5837 33.5417V31.625C32.5837 31.0957 32.1546 30.6667 31.6253 30.6667Z" fill="currentColor"/>
                </svg>
                <span className="hidden lg:inline whitespace-nowrap">{t("common.bookAppointment")}</span>
              </motion.button>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={transitionConfigs.spring}>
                <button
                  onClick={() => {
                    const token = localStorage.getItem("auth_token");
                    if (token) {
                      navigate("/dashboard");
                    } else {
                      navigate("/login");
                    }
                  }}
                  className="bg-white border-2 border-[#1857FE] text-[#1857FE] hover:bg-[#1857FE] hover:text-white rounded-lg lg:rounded-xl p-2 lg:p-2.5 xl:p-3 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  aria-label={checkAuth() ? "Dashboard" : "Login"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" viewBox="0 0 53 53" fill="none">
                    <circle cx="26.5" cy="17.6667" r="8.33333" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12.361 33.0936C13.44 30.916 15.7689 29.8125 18.1992 29.8125H34.8008C37.2311 29.8125 39.56 30.916 40.639 33.0936C41.7138 35.2627 42.8573 38.3809 43.0379 42.0613C43.065 42.613 42.6148 43.0625 42.0625 43.0625H10.9375C10.3852 43.0625 9.93504 42.613 9.96211 42.0613C10.1427 38.3809 11.2862 35.2627 12.361 33.0936Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Tablet/Mobile header */}
        <motion.div
          className="flex lg:hidden items-center justify-between"
          initial="hidden"
          animate="visible"
          variants={animationVariants.container}
        >
          <motion.div variants={animationVariants.fadeIn}>
            <NavLink to="/" className="w-[96px] h-[80px] sm:w-[110px] sm:h-[92px] md:w-[120px] md:h-[100px] block">
              <motion.img
                src={LogoIcon}
                alt="Ko'z Nuri Logo"
                className="w-full h-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={transitionConfigs.smooth}
              />
            </NavLink>
          </motion.div>
          <motion.div
            className="flex items-center gap-2 sm:gap-3"
            variants={animationVariants.container}
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={transitionConfigs.spring}>
              <button
                onClick={() => {
                  const token = localStorage.getItem("auth_token");
                  if (token) {
                    navigate("/dashboard");
                  } else {
                    navigate("/login");
                  }
                }}
                className=" border border-[#1857FE]/30 text-[#1857FE] hover:bg-[#1857FE] hover:text-white rounded-full p-1 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer w-[44px] h-[44px]"
                aria-label={checkAuth() ? "Dashboard" : "Login"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6  flex-shrink-0 pointer-events-none" viewBox="0 0 53 53" fill="none" aria-hidden="true">
                  <circle cx="26.5" cy="17.6667" r="8.33333" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <path d="M12.361 33.0936C13.44 30.916 15.7689 29.8125 18.1992 29.8125H34.8008C37.2311 29.8125 39.56 30.916 40.639 33.0936C41.7138 35.2627 42.8573 38.3809 43.0379 42.0613C43.065 42.613 42.6148 43.0625 42.0625 43.0625H10.9375C10.3852 43.0625 9.93504 42.613 9.96211 42.0613C10.1427 38.3809 11.2862 35.2627 12.361 33.0936Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                </svg>
              </button>
            </motion.div>
            <motion.button
              aria-label="Search"
              className="p-2 rounded-full text-[#1857FE] border border-[#1857FE]/30"
              onClick={() => setIsSearchOpen(true)}
              variants={animationVariants.scaleIn}
              whileHover={animationVariants.hover}
              whileTap={animationVariants.tap}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </motion.button>
            <motion.button
              aria-label="Open menu"
              className="p-2 rounded-full text-[#1857FE] border border-[#1857FE]/30"
              onClick={() => setIsMenuOpen(true)}
              variants={animationVariants.scaleIn}
              whileHover={animationVariants.hover}
              whileTap={animationVariants.tap}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </motion.div>
        </motion.div>
        {/* Mobile menu drawer */}
        <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitionConfigs.smooth}
          >
            <motion.div
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transitionConfigs.smooth}
            />
            <motion.div
              className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-xl p-4 overflow-y-auto"
              variants={animationVariants.slideInRight}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                className="flex items-center justify-between mb-2"
                variants={animationVariants.fadeInDown}
              >
                <span className="font-semibold text-[#1857FE]">Menu</span>
                <motion.button
                  aria-label="Close"
                  className={`${iconBtnMobile}`}
                  onClick={() => setIsMenuOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={transitionConfigs.spring}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                </motion.button>
              </motion.div>
              <motion.div
                variants={animationVariants.fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
              >
                <NavbarMenuRes onNavigate={() => setIsMenuOpen(false)} />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Search modal */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-start justify-center p-4 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transitionConfigs.smooth}
            >
              <motion.div
                className="absolute inset-0 bg-black/40"
                onClick={() => setIsSearchOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                className="relative w-full max-w-xl bg-white rounded-lg shadow-xl p-4 mt-10"
                variants={animationVariants.slideInFromTop}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <motion.div
                  className="flex items-center gap-2 mb-3"
                  variants={animationVariants.fadeIn}
                >
                  <motion.input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("common.search") as string}
                    className="flex-1 border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1857FE]/20 focus:border-[#1857FE]"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={transitionConfigs.spring}
                    autoFocus
                  />
                  <motion.button
                    className="px-3 py-2 bg-[#1857FE] text-white rounded-md"
                    onClick={() => setIsSearchOpen(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={transitionConfigs.spring}
                  >
                    {t("common.close")}
                  </motion.button>
                </motion.div>
                <motion.div
                  className="max-h-96 overflow-y-auto divide-y"
                  variants={animationVariants.container}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence>
                    {searchQuery && filteredServices.length === 0 && (
                      <motion.div
                        className="py-6 text-center text-gray-500 text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {t("common.nothingFound")}
                      </motion.div>
                    )}
                    {filteredServices.map((s, index) => (
                      <motion.div
                        key={s.uuid}
                        variants={animationVariants.fadeInUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.05 }}
                      >
                        <NavLink
                          to={`/service/${s.uuid}`}
                          className="block py-3 hover:bg-gray-50 px-2 rounded transition-colors"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {s.title_uz || s.title_ru || s.title_en}
                          </div>
                          <div className="text-xs text-gray-600 line-clamp-2">
                            {s.subtitle_uz || s.subtitle_ru || s.subtitle_en}
                          </div>
                        </NavLink>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
      {/* Appointment Form Modal */}
      <AppointmentFormModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
      />
      {/* Interest Modal */}
      <InterestModal
        isOpen={isInterestModalOpen}
        onClose={() => {
          setIsInterestModalOpen(false);
        }}
      />
    </>
  );
};

export default Navbar;
