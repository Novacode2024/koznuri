import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { LocalizedDoctor } from "../services/doctorsService";

interface DoctorCardProps {
  doctor: LocalizedDoctor;
  index: number;
  onAppointmentClick: (doctor: LocalizedDoctor) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor,  onAppointmentClick }) => {
  const { t } = useTranslation();

  // Helper function to get image URL
  const getImageUrl = (image: string): string => {
    if (image.startsWith("http")) return image;
    return `https://koznuri.novacode.uz${image}`;
  };

  // Default placeholder image
  const placeholderImage = useMemo(
    () =>
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjQ0NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRvY3Rvcjx0ZXh0PjwvdGV4dD48L3N2Zz4=",
    []
  );

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = placeholderImage;
  };

  // Format experience text
  const experienceText = useMemo(() => {
    if (!doctor.experience) return "";
    return `${doctor.experience} ${t("doctors.yearsExperience")}`;
  }, [doctor.experience, t]);

  // Badge Component
  const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = "",
  }) => (
    <div
      className={`self-end flex items-center justify-end bg-white text-[#1857FE] px-2.5 sm:px-3 py-1 rounded-[5px] shadow-sm ml-auto text-right w-fit ${className}`}
    >
      <span className="text-[11px] sm:text-xs font-medium text-right whitespace-nowrap">
        {children}
      </span>
    </div>
  );

  return (
    <article
      className="w-full max-w-[320px] sm:max-w-[340px] md:max-w-[365px] lg:max-w-[385px] h-[420px] sm:h-[440px] md:h-[450px] lg:h-[461px] bg-[#E9EEFE] rounded-2xl relative overflow-hidden mx-auto shadow-lg hover:shadow-xl transition-all duration-300"
      aria-labelledby={`doctor-${doctor.uuid}-name`}
    >
      {/* Badges Container */}
      <div className="absolute top-2 sm:top-2.5 md:top-3 right-2 sm:right-2.5 md:right-3 z-10 space-y-1.5 sm:space-y-2">
        {experienceText && (
          <Badge className="whitespace-nowrap">{experienceText}</Badge>
        )}
        {doctor.job && <Badge className="whitespace-nowrap">{doctor.job}</Badge>}
      </div>

      {/* Doctor Image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={getImageUrl(doctor.image)}
          alt={doctor.fullName}
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
      </div>

      {/* Doctor Number */}
      {/* <div className="absolute top-2 sm:top-2.5 md:top-3 left-2 sm:left-2.5 md:left-3 z-10">
        <div className="bg-[#1857FE] text-white w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-xs sm:text-sm md:text-base font-bold">
            {(index + 1).toString().padStart(2, '0')}
          </span>
        </div>
      </div> */}

      {/* Doctor Name Background */}
      <div className="absolute bottom-20 sm:bottom-24 md:bottom-20 left-0 right-0 px-2 sm:px-3 md:px-4 z-10">
        <div className="w-[80%] sm:w-[85%] md:w-[90%] mx-auto h-auto rounded-full bg-white/60 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-[40px] sm:min-h-[44px] md:min-h-[48px] lg:min-h-[52px] py-2 sm:py-2.5 md:py-3 lg:mx-5">
            <h3
              id={`doctor-${doctor.uuid}-name`}
              className="text-[14px] font-medium text-black text-center px-2 sm:px-3 md:px-4 line-clamp-2"
            >
              {doctor.fullName}
            </h3>
          </div>
        </div>
      </div>

      {/* Appointment Button */}
      <div className="absolute bottom-3 sm:bottom-3.5 md:bottom-4 left-2 sm:left-3 md:left-4 right-2 sm:right-3 md:right-4 z-10">
        <button
          onClick={() => onAppointmentClick(doctor)}
          className="w-full h-12 sm:h-[50px] md:h-[52px] lg:h-[53px] bg-[#1857FE] text-white rounded-[5px] font-medium text-base sm:text-[17px] md:text-lg hover:bg-[#0d47e8] transition-colors duration-200 shadow-lg active:scale-[0.98] cursor-pointer"
          aria-label={`${t("common.bookAppointment")} - ${doctor.fullName}`}
        >
          {t("common.bookAppointment")}
        </button>
      </div>
    </article>
  );
};

export default DoctorCard;