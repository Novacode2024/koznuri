import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCompanyAddresses } from "../hooks/useCompanyAddresses";
import type { CompanyAddress } from "../services/companyAddressesService";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const { data: companyAddresses, loading } = useCompanyAddresses();

  // Map i18n language to API language codes
  const currentLang = (() => {
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
  })();

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Get title based on current language
  const getTitle = (address: CompanyAddress): string => {
    const titleLangKey = `title_${currentLang}` as keyof CompanyAddress;
    const title = address[titleLangKey] as string;
    return title || address.title_uz || address.title_kr || '';
  };

  // Get address based on current language
  const getAddress = (address: CompanyAddress): string => {
    const addressLangKey = `address_${currentLang}` as keyof CompanyAddress;
    const addr = address[addressLangKey] as string;
    return addr || address.address_uz || address.address_ru || address.address_en || '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label={t("common.close")}
      />

      <div className="relative z-10 flex flex-col w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            {t("common.location")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
            aria-label={t("common.close")}
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1857FE] border-t-transparent mb-4"></div>
                <p className="text-gray-600 text-sm">
                  {t("common.loading") || "Юкланмоқда..."}
                </p>
              </div>
            </div>
          ) : !companyAddresses || companyAddresses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-sm">
                {t("common.noData") || "Маълумот топилмади"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {companyAddresses.map((address, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200 hover:border-[#1857FE] transition-colors duration-200"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Location Icon */}
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#1857FE] to-[#0d47e8] flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_location_modal)">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M15.75 10.5C15.75 11.4946 15.3549 12.4484 14.6517 13.1517C13.9484 13.8549 12.9946 14.25 12 14.25C11.0054 14.25 10.0516 13.8549 9.34835 13.1517C8.64509 12.4484 8.25 11.4946 8.25 10.5C8.25 9.50544 8.64509 8.55161 9.34835 7.84835C10.0516 7.14509 11.0054 6.75 12 6.75C12.9946 6.75 13.9484 7.14509 14.6517 7.84835C15.3549 8.55161 15.75 9.50544 15.75 10.5ZM14.25 10.5C14.2498 11.0969 14.0125 11.6693 13.5902 12.0913C13.168 12.5133 12.5954 12.7502 11.9985 12.75C11.4016 12.7498 10.8292 12.5125 10.4072 12.0902C9.98524 11.668 9.7483 11.0954 9.7485 10.4985C9.7487 9.90156 9.98602 9.32916 10.4083 8.9072C10.8305 8.48524 11.4031 8.2483 12 8.2485C12.5969 8.2487 13.1693 8.48602 13.5913 8.90826C14.0133 9.3305 14.2502 9.90306 14.25 10.5Z"
                            fill="white"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M21 10.5C21 17.25 13.5 24 12 24C10.5 24 3 17.25 3 10.5C3 5.535 7.035 1.5 12 1.5C16.965 1.5 21 5.535 21 10.5ZM19.5 10.5C19.5 13.365 17.88 16.41 15.9 18.84C14.9295 20.031 13.92 21.015 13.095 21.675C12.7515 21.9588 12.3847 22.2132 11.9985 22.4355L11.9205 22.3935C11.5629 22.1801 11.2219 21.9399 10.9005 21.675C10.0725 21.006 9.0705 20.025 8.0955 18.84C6.1155 16.41 4.4955 13.365 4.4955 10.5C4.4955 6.36 7.8555 3 11.9955 3C16.1355 3 19.4955 6.36 19.4955 10.5H19.5Z"
                            fill="white"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_location_modal">
                            <rect width="24" height="24" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>

                    {/* Address Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                        {getTitle(address)}
                      </h3>
                      {address.map_embed && address.map_embed !== '' && address.map_embed !== '#' ? (
                        <a
                          href={address.map_embed}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3 block hover:text-[#1857FE] transition-colors"
                        >
                          {getAddress(address)}
                        </a>
                      ) : (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getAddress(address))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3 block hover:text-[#1857FE] transition-colors"
                        >
                          {getAddress(address)}
                        </a>
                      )}
                      {address.map_embed && address.map_embed !== '' && address.map_embed !== '#' && (
                        <a
                          href={address.map_embed}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-[#1857FE] hover:text-[#0d47e8] transition-colors"
                        >
                          {t("common.viewOnMap")}
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
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
