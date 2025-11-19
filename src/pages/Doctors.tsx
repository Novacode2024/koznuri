import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AllHeader from "../components/AllHeader";
import Location from "../components/HomeComponents/Location";
import LoadingSpinner from "../components/LoadingSpinner";
import DoctorCard from "../components/DoctorCard";
import SEO from "../components/SEO";
import { useDoctors } from "../hooks/useDoctors";
import { localizeDoctor, type DoctorLocale, type LocalizedDoctor } from "../services/doctorsService";

const Doctors = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: doctors, isLoading, error } = useDoctors();

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

  const handleAppointmentClick = (doctor: LocalizedDoctor) => {
    navigate(`/doctor/${doctor.uuid}`);
  };

  if (isLoading) {
    return (
      <>
        <AllHeader title={t("common.doctors") || "Докторларимиз"} link="/doctors" />
        <div className="max-w-[1380px] mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" text={t("common.loading")} />
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AllHeader title={t("common.doctors") || "Докторларимиз"} link="/doctors" />
        <div className="max-w-[1380px] mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              {t("common.errorOccurred") || "Хатолик юз берди"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {error.message || "Маълумотларни юклашда хатолик"}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!localizedDoctors || localizedDoctors.length === 0) {
    return (
      <>
        <AllHeader title={t("common.doctors") || "Докторларимиз"} link="/doctors" />
        <div className="max-w-[1380px] mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👨‍⚕️</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {t("common.noDoctorsFound") || "Докторлар топилмади"}
            </h3>
            <p className="text-sm text-gray-500">
              {t("common.noDoctorsAvailable") || "Ҳозирча докторлар мавжуд эмас"}
            </p>
          </div>
        </div>
      </>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": t("common.doctors") || "Докторларимиз",
    "description": t("doctors.subtitle") || "20 йиллик тажрибага эга, юқори малакали кўз шифокорлари. Хар бир мутахассис ўз сохасидаги энг замонавий усулларни қўллайди.",
    "url": "https://koznuri.novacode.uz/doctors",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": localizedDoctors.length,
      "itemListElement": localizedDoctors.map((doctor, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Physician",
          "name": doctor.fullName,
          "url": `https://koznuri.novacode.uz/doctor/${doctor.uuid}`
        }
      }))
    }
  };

  return (
    <>
      <SEO
        title={`${t("common.doctors") || "Докторларимиз"} | Ko'z Nuri`}
        description={t("doctors.subtitle") || "20 йиллик тажрибага эга, юқори малакали кўз шифокорлари. Хар бир мутахассис ўз сохасидаги энг замонавий усулларни қўллайди."}
        keywords="ko'z shifokorlari, oftalmologlar, ko'z doktorlari, Toshkent, O'zbekiston, ko'z tibbiy markazi"
        canonical="https://koznuri.novacode.uz/doctors"
        structuredData={structuredData}
      />
      <AllHeader title={t("common.doctors") || "Докторларимиз"} link="/doctors" />
      <div className="max-w-[1380px] mx-auto px-4 ">
        {/* Header Section */}
        <div className="flex items-center justify-center flex-col gap-4 sm:gap-5 md:gap-[25px] mt-15  mb-6 sm:mb-8 md:mb-[32px]">
          <h1 className="text-[22px] sm:text-[28px] md:text-[34px] lg:text-[38px] font-bold text-center">
            {t("doctors.ourDoctors") || "Бизнинг шифокорларимиз"}
          </h1>
          <p className="text-[14px] sm:text-[16px] md:text-[20px] lg:text-[32px] w-full sm:w-[90%] md:w-[85%] lg:w-[80%] text-center text-[#555] lg:text-inherit">
            {t("doctors.subtitle") || "20 йиллик тажрибага эга, юқори малакали кўз шифокорлари. Хар бир мутахассис ўз сохасидаги энг замонавий усулларни қўллайди."}
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 justify-items-center max-w-full sm:max-w-[680px] md:max-w-[960px] lg:max-w-[1200px] mx-auto">
          {localizedDoctors.map((doctor, index) => (
            <DoctorCard
              key={doctor.uuid}
              doctor={doctor}
              index={index}
              onAppointmentClick={handleAppointmentClick}
            />
          ))}
        </div>

      </div>
      <div className="mt-15">
      <Location />
      </div>
    </>
  );
};

export default Doctors;
