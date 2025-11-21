import { useState, useEffect, useRef, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import uzb from "../assets/icons/uzb.png";
import rus from "../assets/icons/russia.png";
import kaz from "../assets/icons/kaz.png";
import tj from "../assets/icons/tojik.png";
import en from "../assets/icons/usa.png";
import krgiz from "../assets/icons/kgz.png";
import { useTranslation } from "react-i18next";
import { useServices } from "../hooks/useServices";
import {
  localizeService,
  type ServiceLocale,
} from "../services/servicesService";
import LocationModal from "./LocationModal";
import { mapI18nToServiceLocale } from "../utils/languageMapper";

interface NavigationLink {
  translationKey: string;
  href: string;
  hasDropdown: boolean;
  submenu: Array<{ translationKey: string; href: string }>;
}

const NavbarMenu = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { i18n, t } = useTranslation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const navigate = useNavigate();
  const { data: services } = useServices();
  const serviceLocale = useMemo((): ServiceLocale => {
    return mapI18nToServiceLocale(i18n.language);
  }, [i18n.language]);

  const navigationLinks: NavigationLink[] = [
    { translationKey: "services", href: "/services", hasDropdown: false, submenu: [] },
    {
      translationKey: "about",
      href: "/about",
      hasDropdown: true,
      submenu: [
        { translationKey: "about", href: "/about" },
        { translationKey: "doctors", href: "/doctors" },
        { translationKey: "technology", href: "/technologies" },
      ],
    },
    { translationKey: "news", href: "/news", hasDropdown: false, submenu: [] },
    { translationKey: "locationTitle", href: "/location", hasDropdown: false, submenu: [] },
    { translationKey: "reviewsTitle", href: "/reviews", hasDropdown: false, submenu: [] },
    { translationKey: "media", href: "/media", hasDropdown: false, submenu: [] },
    { translationKey: "usageGuide", href: "/usage", hasDropdown: false, submenu: [] },
  ];

  const languages = [
    { code: "uz-cyrillic", name: "Ўз", flag: uzb },
    { code: "uz-latin", name: "Oʻz", flag: uzb },
    { code: "ru", name: "Ru", flag: rus },
    { code: "en", name: "En", flag: en },
    { code: "kz", name: "Kz", flag: kaz },
    { code: "tg", name: "Tj", flag: tj },
    { code: "ky", name: "Kg", flag: krgiz },
  ];

  const dropdownRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);



  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
        setActiveDropdown(null);
      }
      if (languageRef.current && !languageRef.current.contains(target)) {
        setIsLanguageOpen(false);
      }
    };

    if (isDropdownOpen || isLanguageOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isLanguageOpen]);

  return (
    <div >
      <div className="max-w-[1380px] w-full mx-auto px-4 ">
        <div className="hidden lg:flex items-center justify-between h-16">
          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center justify-between w-full gap-4">
            {navigationLinks.map((link, index) => (
              <div
                key={index}
                className="relative"
                ref={link.hasDropdown ? dropdownRef : null}
              >
                {link.hasDropdown ? (
                  <button
                    className="hover:text-[#1857FE] text-[#282828] font-medium lg:text-[16px] xl:text-[17px] 2xl:text-[18px] transition-colors duration-200 flex items-center gap-1"
                    onClick={() => {
                      setIsDropdownOpen(!isDropdownOpen);
                      setActiveDropdown(
                        activeDropdown === link.translationKey ? null : link.translationKey
                      );
                    }}
                  >
                    {t(`common.${link.translationKey}`)}
                    <svg
                      className="w-4 h-4"
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
                ) : link.translationKey === "locationTitle" ? (
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="hover:text-[#1857FE] text-[#282828] font-medium lg:text-[16px] xl:text-[17px] 2xl:text-[18px] transition-colors duration-200 flex items-center gap-1"
                  >
                    {t(`common.${link.translationKey}`)}
                  </button>
                ) : link.translationKey === "reviewsTitle" ? (
                  <button
                    onClick={() => {
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
                    className="hover:text-[#1857FE] text-[#282828] font-medium lg:text-[16px] xl:text-[17px] 2xl:text-[18px] transition-colors duration-200 flex items-center gap-1"
                  >
                    {t(`common.${link.translationKey}`)}
                  </button>
                ) : (
                  <NavLink
                    to={link.href}
                    className={({ isActive }) =>
                      ` hover:text-[#1857FE] text-[#282828] font-medium lg:text-[16px] xl:text-[17px] 2xl:text-[18px] transition-colors duration-200 flex items-center gap-1 ${
                        isActive ? "text-[#1857FE]" : ""
                      }`
                    }
                  >
                    {t(`common.${link.translationKey}`)}
                  </NavLink>
                )}

                {/* Dropdown Menu with Animation */}
                {link.hasDropdown &&
                  isDropdownOpen &&
                  activeDropdown === link.translationKey && (
                    <div
                      className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
                      style={{
                        animation: "slideDown 0.3s ease-out",
                      }}
                    >
                      <div className="py-2">
                        {link.submenu.map((subItem, subIndex) => (
                          <NavLink
                            key={subIndex}
                            to={subItem.href}
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setActiveDropdown(null);
                            }}
                            className={({ isActive }) =>
                              `w-full text-left px-2 py-3 text-sm flex flex-col transition-all duration-200 border-l-4 border-transparent hover:border-[#1857FE] hover:bg-[#1857FE] hover:text-white ${
                                isActive
                                  ? "bg-[#1857FE] text-white border-[#1857FE]"
                                  : "text-gray-700"
                              }`
                            }
                            style={{
                              animation: `fadeInUp 0.3s ease-out ${
                                subIndex * 0.1
                              }s both`,
                            }}
                          >
                            {t(`common.${subItem.translationKey}`)}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
            {/* Language selector (as nav item) */}
            <div className="relative" ref={languageRef}>
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex h-10 items-center gap-2 text-gray-700 hover:text-[#1857FE] transition-colors duration-200"
              >
                <span className="font-medium lg:text-[15px] xl:text-[16px] 2xl:text-[17px]">
                  {languages
                    .find((lang) => lang.code === i18n.language)
                    ?.name.split(" ")[0] || "Уз"}
                </span>
                <img
                  src={
                    languages.find((lang) => lang.code === i18n.language)?.flag ||
                    uzb
                  }
                  alt="Current Language Flag"
                  className="w-[25px] h-[19px] rounded-sm object-cover"
                />
                <svg
                  className="w-4 h-4"
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
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("common.languages")}:
                    </div>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors duration-200 ${
                          i18n.language === lang.code
                            ? "bg-[#1857FE] text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          setIsLanguageOpen(false);
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
                </div>
              )}
            </div>
            {/* Search (as nav item) */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1857FE] shadow-sm hover:text-blue-700"
              aria-label={t("common.search") || "Қидириш"}
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
            </button>
          </nav>

          {/* Mobile Menu Button removed (controlled by parent) */}
        </div>

      
      </div>
      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 p-4">
          <div className="mt-20 w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-lg font-semibold text-[#282828]">{t("common.searchServices") || "Хизматлардан қидириш"}</h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-xl text-gray-500 hover:text-gray-700"
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
                  placeholder={t("common.searchServicePlaceholder") || "Хизмат номини ёзинг..."}
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
                    const q = searchQuery.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      s.title.toLowerCase().includes(q) ||
                      s.subtitle.toLowerCase().includes(q) ||
                      s.description.toLowerCase().includes(q)
                    );
                  })
                  .map((s) => (
                    <li key={s.uuid}>
                      <button
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                          navigate(`/service/${s.uuid}`);
                        }}
                        className="flex w-full items-start gap-3 rounded-lg p-3 text-left hover:bg-gray-50"
                      >
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {s.image ? (
                            <img
                              src={s.image.startsWith("http") ? s.image : `https://koznuri.novacode.uz${s.image}`}
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
                  <li className="px-4 py-6 text-center text-sm text-gray-500">{t("common.noServices") || "Хизматлар топилмади"}</li>
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
  );
};

export default NavbarMenu;
