import React, { useState, useEffect, useRef, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useWorkTimes } from '../hooks/useWorkTimes'
import { useCompanyAddresses } from '../hooks/useCompanyAddresses'
import { useCompanyPhones } from '../hooks/useCompanyPhones'
import { useServices } from '../hooks/useServices'
import { localizeService, type ServiceLocale } from '../services/servicesService'
import LocationModal from './LocationModal'
import { mapI18nToServiceLocale, mapI18nToApiLanguage } from '../utils/languageMapper'
import uzb from '../assets/icons/uzb.png'
import rus from '../assets/icons/russia.png'
import kaz from '../assets/icons/kaz.png'
import tj from '../assets/icons/tojik.png'
import en from '../assets/icons/usa.png'
import krgiz from '../assets/icons/kgz.png'
import type { WorkTime } from '../services/workTimesService'
import type { CompanyAddress } from '../services/companyAddressesService'

interface NavigationLink {
  translationKey: string;
  href: string;
  hasDropdown: boolean;
  submenu: Array<{ translationKey: string; href: string }>;
}

interface NavbarMenuResProps {
  onNavigate?: () => void;
}

const NavbarMenuRes: React.FC<NavbarMenuResProps> = ({ onNavigate }) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  
  const { data: services } = useServices()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const languageRef = useRef<HTMLDivElement>(null)

  const { data: workTimes } = useWorkTimes()
  const { data: companyAddresses } = useCompanyAddresses()
  const { data: companyPhones } = useCompanyPhones()
  const serviceLocale = useMemo((): ServiceLocale => {
    return mapI18nToServiceLocale(i18n.language);
  }, [i18n.language])

  // Map i18n language to API language codes
  const currentLang = useMemo(() => {
    return mapI18nToApiLanguage(i18n.language);
  }, [i18n.language])

  const languages = [
    { code: 'uz-cyrillic', name: 'Ўз', flag: uzb },
    { code: 'uz-latin', name: 'Oʻz', flag: uzb },
    { code: 'ru', name: 'Ru', flag: rus },
    { code: 'en', name: 'En', flag: en },
    { code: 'kz', name: 'Kz', flag: kaz },
    { code: 'tg', name: 'Tg', flag: tj },
    { code: 'ky', name: 'Ky', flag: krgiz },
  ]

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false)
        setActiveDropdown(null)
      }
      if (languageRef.current && !languageRef.current.contains(target)) {
        setIsLanguageOpen(false)
      }
    }

    if (isDropdownOpen || isLanguageOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen, isLanguageOpen])

  // Get first address for display
  const firstAddress = useMemo(() => {
    if (!companyAddresses || !Array.isArray(companyAddresses) || companyAddresses.length === 0) {
      return null;
    }
    return companyAddresses[0] || null;
  }, [companyAddresses]);

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

  // Get first phone and format it for display
  const phoneDisplay = useMemo(() => {
    if (!companyPhones || !Array.isArray(companyPhones) || companyPhones.length === 0) {
      return {
        title: t('common.callCenter'),
        phone: '+998 55 514 03 33'
      }
    }
    
    const firstPhone = companyPhones[0]
    if (!firstPhone || !firstPhone.phone) {
      return {
        title: t('common.callCenter'),
        phone: '+998 55 514 03 33'
      }
    }
    
    const title = firstPhone.title_uz || t('common.callCenter')
    const phone = firstPhone.phone.trim()
    
    return { title, phone }
  }, [companyPhones, t])

  // Get first work time and format it for display
  const workTimeDisplay = useMemo(() => {
    if (!workTimes || !Array.isArray(workTimes) || workTimes.length === 0) {
      return { time: t('common.workSchedule') }
    }
    
    const firstWorkTime = workTimes[0]
    if (!firstWorkTime || !firstWorkTime.start_time || !firstWorkTime.end_time) {
      return { time: t('common.workSchedule') }
    }
    
    const langKey = `title_${currentLang}` as keyof WorkTime
    const title = (firstWorkTime[langKey] as string) || firstWorkTime.title_uz || firstWorkTime.title_ru || firstWorkTime.title_en || ''
    const time = `${firstWorkTime.start_time} - ${firstWorkTime.end_time}`
    
    return { time: title ? `${title}: ${time}` : time }
  }, [workTimes, currentLang, t])

  const navigationLinks: NavigationLink[] = [
    { translationKey: 'services', href: '/services', hasDropdown: false, submenu: [] },
    {
      translationKey: 'about',
      href: '/about',
      hasDropdown: true,
      submenu: [
        { translationKey: 'about', href: '/about' },
        { translationKey: 'doctors', href: '/doctors' },
        { translationKey: 'technology', href: '/technologies' },
      ],
    },
    { translationKey: 'news', href: '/news', hasDropdown: false, submenu: [] },
    { translationKey: 'locationTitle', href: '/location', hasDropdown: false, submenu: [] },
    { translationKey: 'reviewsTitle', href: '/reviews', hasDropdown: false, submenu: [] },
    { translationKey: 'media', href: '/media', hasDropdown: false, submenu: [] },
    { translationKey: 'usageGuide', href: '/usage', hasDropdown: false, submenu: [] },
  ]

  return (
    <div className="lg:hidden">
      <nav className="flex flex-col space-y-2 mt-7">
        {navigationLinks.map((link, index) => (
          <div
            key={index}
            className="relative"
            ref={link.hasDropdown ? dropdownRef : null}
          >
            {link.hasDropdown ? (
              <button
                className="w-full flex items-center justify-between text-gray-700 hover:text-[#1857FE] py-2 px-4 rounded-md hover:bg-gray-100 transition-colors duration-200"
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen)
                  setActiveDropdown(
                    activeDropdown === link.translationKey ? null : link.translationKey
                  )
                }}
              >
                <span>{t(`common.${link.translationKey}`)}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${activeDropdown === link.translationKey ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ) : link.translationKey === 'locationTitle' ? (
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="w-full text-left text-gray-700 hover:text-[#1857FE] py-2 px-4 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                {t(`common.${link.translationKey}`)}
              </button>
            ) : link.translationKey === 'reviewsTitle' ? (
              <button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate()
                  }
                  if (window.location.pathname !== '/') {
                    navigate('/')
                    setTimeout(() => {
                      const element = document.getElementById('reviews')
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }, 100)
                  } else {
                    const element = document.getElementById('reviews')
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }
                }}
                className="w-full text-left text-gray-700 hover:text-[#1857FE] py-2 px-4 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                {t(`common.${link.translationKey}`)}
              </button>
            ) : (
              <NavLink
                to={link.href}
                onClick={() => {
                  if (onNavigate) {
                    onNavigate()
                  }
                  setIsDropdownOpen(false)
                  setActiveDropdown(null)
                }}
                className={({ isActive }) =>
                  `text-gray-700 hover:text-[#1857FE] py-2 px-4 rounded-md hover:bg-gray-100 transition-colors duration-200 ${
                    isActive ? 'text-[#1857FE] bg-blue-50' : ''
                  }`
                }
              >
                {t(`common.${link.translationKey}`)}
              </NavLink>
            )}

            {link.hasDropdown &&
              isDropdownOpen &&
              activeDropdown === link.translationKey && (
                <div className="ml-4 mt-1 flex flex-col space-y-1">
                  {link.submenu.map((subItem, subIndex) => (
                    <NavLink
                      key={subIndex}
                      to={subItem.href}
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate()
                        }
                        setIsDropdownOpen(false)
                        setActiveDropdown(null)
                      }}
                      className={({ isActive }) =>
                        `text-sm text-gray-600 hover:text-[#1857FE] py-1 px-4 rounded-md hover:bg-gray-100 transition-colors duration-200 ${
                          isActive ? 'text-[#1857FE] bg-blue-50' : ''
                        }`
                      }
                    >
                      {t(`common.${subItem.translationKey}`)}
                    </NavLink>
                  ))}
                </div>
              )}
          </div>
        ))}
        
        {/* Language selector */}
        <div className="relative pt-2" ref={languageRef}>
          <button
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            className="w-full flex items-center justify-between text-gray-700 hover:text-[#1857FE] py-2 px-4 rounded-md hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <img
                src={
                  languages.find((lang) => lang.code === i18n.language)?.flag ||
                  uzb
                }
                alt="Current Language Flag"
                className="w-[25px] h-[19px] rounded-sm object-cover"
              />
              <span className="font-medium">
                {languages
                  .find((lang) => lang.code === i18n.language)
                  ?.name.split(' ')[0] || 'Ўз'}
              </span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Language Dropdown */}
          {isLanguageOpen && (
            <div className="ml-4 mt-1 flex flex-col space-y-1 bg-white rounded-md shadow-lg border border-gray-200 z-50">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                {t('common.languages')}:
              </div>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors duration-200 ${
                    i18n.language === lang.code
                      ? 'bg-[#1857FE] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    i18n.changeLanguage(lang.code)
                    setIsLanguageOpen(false)
                  }}
                >
                  <img
                    src={lang.flag}
                    alt={`${lang.name} Flag`}
                    className="w-[25px] h-[19px] rounded-sm object-cover"
                  />
                  <span>{lang.name}</span>
                  {i18n.language === lang.code && (
                    <svg
                      className="w-4 h-4 ml-auto text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search button */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-center gap-2 text-gray-700 hover:text-[#1857FE] py-2 px-4 rounded-md hover:bg-gray-100 transition-colors duration-200"
          aria-label={t('common.search') || 'Қидириш'}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span>{t('common.search') || 'Қидириш'}</span>
        </button>
      </nav>

      {/* Contact Info Section - Address, Phone, Working Hours */}
      <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
        {/* Address */}
        {firstAddress && (
          <div className="flex items-start gap-3 px-4 py-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#1857FE] to-[#0d47e8] flex items-center justify-center mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <g clipPath="url(#clip0_location_res)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M15.75 10.5C15.75 11.4946 15.3549 12.4484 14.6517 13.1517C13.9484 13.8549 12.9946 14.25 12 14.25C11.0054 14.25 10.0516 13.8549 9.34835 13.1517C8.64509 12.4484 8.25 11.4946 8.25 10.5C8.25 9.50544 8.64509 8.55161 9.34835 7.84835C10.0516 7.14509 11.0054 6.75 12 6.75C12.9946 6.75 13.9484 7.14509 14.6517 7.84835C15.3549 8.55161 15.75 9.50544 15.75 10.5ZM14.25 10.5C14.2498 11.0969 14.0125 11.6693 13.5902 12.0913C13.168 12.5133 12.5954 12.7502 11.9985 12.75C11.4016 12.7498 10.8292 12.5125 10.4072 12.0902C9.98524 11.668 9.7483 11.0954 9.7485 10.4985C9.7487 9.90156 9.98602 9.32916 10.4083 8.9072C10.8305 8.48524 11.4031 8.2483 12 8.2485C12.5969 8.2487 13.1693 8.48602 13.5913 8.90826C14.0133 9.3305 14.2502 9.90306 14.25 10.5Z" fill="white"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M21 10.5C21 17.25 13.5 24 12 24C10.5 24 3 17.25 3 10.5C3 5.535 7.035 1.5 12 1.5C16.965 1.5 21 5.535 21 10.5ZM19.5 10.5C19.5 13.365 17.88 16.41 15.9 18.84C14.9295 20.031 13.92 21.015 13.095 21.675C12.7515 21.9588 12.3847 22.2132 11.9985 22.4355L11.9205 22.3935C11.5629 22.1801 11.2219 21.9399 10.9005 21.675C10.0725 21.006 9.0705 20.025 8.0955 18.84C6.1155 16.41 4.4955 13.365 4.4955 10.5C4.4955 6.36 7.8555 3 11.9955 3C16.1355 3 19.4955 6.36 19.4955 10.5H19.5Z" fill="white"/>
                </g>
                <defs>
                  <clipPath id="clip0_location_res">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-gray-900 mb-1">{getTitle(firstAddress)}</h3>
              {firstAddress.map_embed && firstAddress.map_embed !== '' && firstAddress.map_embed !== '#' ? (
                <a
                  href={firstAddress.map_embed}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-600 leading-relaxed mb-1 block hover:text-[#1857FE] transition-colors"
                >
                  {getAddress(firstAddress)}
                </a>
              ) : (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getAddress(firstAddress))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-600 leading-relaxed mb-1 block hover:text-[#1857FE] transition-colors"
                >
                  {getAddress(firstAddress)}
                </a>
              )}
              {firstAddress.map_embed && firstAddress.map_embed !== '' && firstAddress.map_embed !== '#' && (
                <a
                  href={firstAddress.map_embed}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#1857FE] hover:text-[#0d47e8] transition-colors inline-flex items-center gap-1"
                >
                  {t("common.viewOnMap")}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Phone */}
        {companyPhones && companyPhones.length > 0 && (
          <div className="flex items-start gap-3 px-4 py-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#1857FE] to-[#0d47e8] flex items-center justify-center mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 22" fill="none">
                    <g clipPath="url(#clip0_phone)">
                      <path fillRule="evenodd" clipRule="evenodd" d="M3.67564 1.25455C5.06649 -0.1465 7.35678 0.102447 8.52135 1.6795L9.96364 3.62939C10.9122 4.91234 10.8276 6.70476 9.70192 7.83834L9.42992 8.11392C9.39908 8.2296 9.39594 8.35108 9.42078 8.46824C9.49278 8.94066 9.88249 9.94108 11.5145 11.5853C13.1465 13.2295 14.1408 13.6232 14.6139 13.6973C14.7331 13.7216 14.8563 13.718 14.9739 13.6869L15.4402 13.2168C16.4414 12.2094 17.9774 12.0207 19.2162 12.7027L21.3991 13.9069C23.2699 14.9351 23.7419 17.5102 22.2105 19.0537L20.5865 20.6887C20.0745 21.2039 19.3865 21.6335 18.5476 21.7134C16.4791 21.9091 11.6596 21.659 6.59335 16.5561C1.86535 11.7926 0.957921 7.63803 0.842493 5.59087C0.78535 4.55571 1.26764 3.68034 1.88249 3.06203L3.67564 1.25455Z" fill="white"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_phone">
                        <rect width="24" height="22" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-gray-900 mb-1">{phoneDisplay.title}</h3>
              <a 
                href={`tel:${phoneDisplay.phone.replace(/\s/g, '')}`} 
                className="text-base font-semibold text-[#1857FE] hover:text-[#0d47e8] transition-colors"
              >
                {phoneDisplay.phone}
              </a>
            </div>
          </div>
        )}

        {/* Working Hours */}
        {workTimes && workTimes.length > 0 && (
          <div className="flex items-start gap-3 px-4 py-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#1857FE] to-[#0d47e8] flex items-center justify-center mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <g clipPath="url(#clip0_time_res)">
                  <path d="M11.9813 0.0481567C18.2933 0.0481567 23.4099 5.37792 23.4099 11.9529C23.4099 18.5279 18.2933 23.8577 11.9813 23.8577C5.66931 23.8577 0.552734 18.5279 0.552734 11.9529C0.552734 5.37792 5.66931 0.0481567 11.9813 0.0481567Z" fill="white"/>
                  <path d="M11.9813 4.81006C12.2612 4.8101 12.5314 4.91715 12.7406 5.11091C12.9498 5.30467 13.0834 5.57167 13.1162 5.86125L13.1242 6.00054V11.4601L16.2179 14.6827C16.4228 14.8969 16.5418 15.1844 16.5507 15.4867C16.5596 15.789 16.4576 16.0835 16.2656 16.3104C16.0736 16.5373 15.8058 16.6795 15.5168 16.7082C15.2277 16.7368 14.939 16.6498 14.7093 16.4648L14.6019 16.366L11.1733 12.7946C10.9957 12.6094 10.8816 12.3684 10.8487 12.1089L10.8384 11.9529V6.00054C10.8384 5.6848 10.9589 5.382 11.1732 5.15874C11.3875 4.93549 11.6782 4.81006 11.9813 4.81006Z" fill="#1857FE"/>
                </g>
                <defs>
                  <clipPath id="clip0_time_res">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-gray-900 mb-1">{t("common.workingHours")}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{workTimeDisplay.time}</p>
            </div>
          </div>
        )}
      </div>

      {/* Appointment Button */}
      <div className="mt-6 pt-6 border-t border-gray-200 px-4">
        <button
          className="w-full bg-[#1857FE] text-white rounded-lg py-3 px-4 font-semibold text-base hover:bg-[#0d47e8] transition-colors duration-200 shadow-lg"
          onClick={() => {
            // Handle appointment booking - you can add AppointmentModal here if needed
            // For now, it's just a button
          }}
        >
          {t("common.bookAppointment")}
        </button>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 p-4">
          <div className="mt-20 w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-lg font-semibold text-[#282828]">{t('common.searchServices') || 'Хизматлардан қидириш'}</h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-xl text-gray-500 hover:text-gray-700 cursor-pointer"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="px-4 py-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  placeholder={t('common.searchServicePlaceholder') || 'Хизмат номини ёзинг...'}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-transparent focus:ring-2 focus:ring-[#1857FE]"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#1857FE]">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-2 pb-4">
              <ul className="divide-y">
                {(services || [])
                  .map((s) => localizeService(s, serviceLocale))
                  .filter((s) => {
                    const q = searchQuery.trim().toLowerCase()
                    if (!q) return true
                    return (
                      s.title.toLowerCase().includes(q) ||
                      s.subtitle.toLowerCase().includes(q) ||
                      s.description.toLowerCase().includes(q)
                    )
                  })
                  .map((s) => (
                    <li key={s.uuid}>
                      <button
                        onClick={() => {
                          setIsSearchOpen(false)
                          setSearchQuery('')
                          navigate(`/service/${s.uuid}`)
                          if (onNavigate) {
                            onNavigate()
                          }
                        }}
                        className="flex w-full items-start gap-3 rounded-lg p-3 text-left hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {s.image ? (
                            <img
                              src={s.image.startsWith('http') ? s.image : `https://koznuri.novacode.uz${s.image}`}
                              alt={s.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">–</div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-[#282828]">{s.title}</div>
                          <div className="line-clamp-2 text-sm text-[#747474]">{s.subtitle}</div>
                        </div>
                      </button>
                    </li>
                  ))}
                {services && services.length === 0 && (
                  <li className="px-4 py-6 text-center text-sm text-gray-500">{t('common.noServices') || 'Хизматлар топилмади'}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  )
}

export default NavbarMenuRes;