import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';
import DoctorCard from '../DoctorCard';
import { useDoctors } from '../../hooks/useDoctors';
import { localizeDoctor, type DoctorLocale, type LocalizedDoctor } from '../../services/doctorsService';

const WhereDoctors = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: doctors, isLoading, error } = useDoctors();
  const [itemsPerView, setItemsPerView] = useState(3);

  // Determine items per view based on viewport width
  useEffect(() => {
    const calculateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerView(1); // mobile
      } else if (width < 1024) {
        setItemsPerView(2); // tablet
      } else {
        setItemsPerView(3); // desktop
      }
    };

    calculateItemsPerView();
    window.addEventListener('resize', calculateItemsPerView);
    return () => window.removeEventListener('resize', calculateItemsPerView);
  }, []);

  // Map i18next language to doctor locale
  const doctorLocale = useMemo((): DoctorLocale => {
    const lang = i18n.language;
    const localeMap: Record<string, DoctorLocale> = {
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

  // Localize all doctors based on current language
  const localizedDoctors: LocalizedDoctor[] = useMemo(() => {
    if (!doctors) return [];
    return doctors
      .map((doctor) => localizeDoctor(doctor, doctorLocale))
      .sort((a, b) => a.order - b.order);
  }, [doctors, doctorLocale]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < localizedDoctors.length - itemsPerView) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleAppointmentClick = (doctor: LocalizedDoctor) => {
    navigate(`/doctor/${doctor.uuid}`);
  };

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < Math.max(0, localizedDoctors.length - itemsPerView);

  const cardWidthPercent = useMemo(() => 100 / itemsPerView, [itemsPerView]);

  // Loading state
  if (isLoading) {
    return (
      <section className="bg-[#fff] py-10 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex justify-center items-center min-h-[260px] md:min-h-[340px] lg:min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error || !localizedDoctors || localizedDoctors.length === 0) {
    return (
      <section className="bg-[#fff] py-10 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="text-center py-10 md:py-12">
            <h3 className="text-base md:text-lg font-semibold text-gray-600 mb-2">
              {t("common.noDoctorsFound") || "Докторлар топилмади"}
            </h3>
            <p className="text-sm md:text-base text-gray-500">
              {t("common.noDoctorsAvailable") || "Ҳозирча докторлар мавжуд эмас"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#fff] py-10 md:py-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-5 md:px-6">
        <div className='mb-8 md:mb-12 text-center'>
          <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-[38px] font-bold'>
            {t("doctors.ourDoctors")}
          </h1>
          <p className='text-base sm:text-lg md:text-2xl lg:text-[32px] text-[#282828] mt-2 md:mt-3'>
            {t("doctors.subtitle")}
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12">
          {/* Left Column */}
          <div className="lg:w-1/4 space-y-5 md:space-y-6 lg:space-y-8">
            <h2 className="text-xl md:text-2xl lg:text-[28px] font-bold text-[#282828]">
              {t("doctors.allDoctors")}
            </h2>
            
            <div className="space-y-2 md:space-y-3">
              <p className="text-[#282828] text-base sm:text-lg md:text-xl lg:text-[22px]">
                {t("doctors.improvesSkillsRegularly")}
              </p>
              <p className="text-[#282828] text-base sm:text-lg md:text-xl lg:text-[22px]">
                {t("doctors.participatesInConferences")}
              </p>
              <p className="text-[#282828] text-base sm:text-lg md:text-xl lg:text-[22px]">
                {t("doctors.individualApproach")}
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 md:gap-4">
              <button
                onClick={handlePrev}
                disabled={!canGoPrev}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                  canGoPrev
                    ? 'border-[#1857FE] text-[#1857FE] hover:bg-[#1857FE] hover:text-white cursor-pointer'
                    : 'border-gray-300 text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Previous"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                  canGoNext
                    ? 'border-[#1857FE] text-[#1857FE] hover:bg-[#1857FE] hover:text-white cursor-pointer'
                    : 'border-gray-300 text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Next"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Column - Custom Carousel */}
          <div className="lg:w-3/4">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * cardWidthPercent}%)` }}
              >
                {localizedDoctors.map((doctor, index) => (
                  <div
                    key={doctor.uuid}
                    className="flex-shrink-0 px-3"
                    style={{ width: `${cardWidthPercent}%` }}
                  >
                    <DoctorCard 
                      doctor={doctor}
                      index={index}
                      onAppointmentClick={handleAppointmentClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhereDoctors;
