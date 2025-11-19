import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useStatistics } from "../../hooks/useStatistics";
import LoadingSpinner from "../LoadingSpinner";
import { mapI18nToApiLanguage } from "../../utils/languageMapper";

const Status = () => {
  const { t, i18n } = useTranslation();
  const { data: statistics, loading, error } = useStatistics();
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});


  const sectionRef = useRef<HTMLDivElement>(null);

  // Get current language code for API data
  const getCurrentLanguageCode = () => {
    // Import is done at top of file
    return mapI18nToApiLanguage(i18n.language);
  };

  // Get localized content based on current language
  const getLocalizedContent = (item: {
    title_uz: string;
    title_kr: string;
    title_ru: string;
    title_en: string;
    title_tj: string;
    title_kz: string;
    title_kg: string;
    subtitle_uz: string;
    subtitle_kr: string;
    subtitle_ru: string;
    subtitle_en: string;
    subtitle_tj: string;
    subtitle_kz: string;
    subtitle_kg: string;
    value: string;
    order: number;
  }) => {
    const langCode = getCurrentLanguageCode();
    return {
      title:
        (item[`title_${langCode}` as keyof typeof item] as string) ||
        item.title_kr,
      subtitle:
        (item[`subtitle_${langCode}` as keyof typeof item] as string) ||
        item.subtitle_kr,
      value: item.value,
      order: item.order,
    };
  };

  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  // Animate counting
  useEffect(() => {
    if (!isVisible || !statistics || statistics.length === 0) return;

    const duration = 2000; // 2 seconds
    const steps = 60; // 60 steps for smooth animation
    const stepDuration = duration / steps;

    const animateCount = (uuid: string, targetValue: number) => {
      let currentStep = 0;
      const increment = targetValue / steps;

      const timer = setInterval(() => {
        currentStep++;
        const currentValue = Math.min(
          Math.floor(increment * currentStep),
          targetValue
        );

        setCounts((prev) => ({
          ...prev,
          [uuid]: currentValue,
        }));

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);
    };

    // Sort statistics by order and start animations
    const sortedStats = [...statistics].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
    sortedStats.forEach((stat, index) => {
      // Extract numeric value from strings like "70 000+", "30 000+", "15 000+", "7"
      const numericValue = parseInt(stat.value.replace(/[^\d]/g, "")) || 0;

      // Start animation immediately for first item, delay for others
      setTimeout(
        () => animateCount(stat.uuid, numericValue),
        index * 200 // 200ms delay between each animation
      );
    });
  }, [isVisible, statistics]);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return num.toLocaleString("en-US");
    }
    return num.toString();
  };

  // Format the display value with proper suffix
  const formatDisplayValue = (value: string, currentCount: number): string => {
    // If animation hasn't started yet, show the original value
    if (currentCount === 0) {
      return value;
    }

    const suffix = value.replace(/[\d\s]/g, ""); // Extract suffix like "+", "%", etc.
    const formattedNumber = formatNumber(currentCount);
    return formattedNumber + suffix;
  };

  if (loading) {
    return (
      <section className="py-10 md:py-14 lg:py-16 relative">
        <div className="w-full max-w-full overflow-x-hidden">
          <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-6">
            <LoadingSpinner size="lg" text={t("common.loading")} />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10 md:py-14 lg:py-16 relative">
        <div className="w-full max-w-full overflow-x-hidden">
          <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-6">
            <div className="text-center text-red-600">
              <p>Error: {error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!statistics || statistics.length === 0) {
    return (
      <section className="py-10 md:py-14 lg:py-16 relative">
        <div className="w-full max-w-full overflow-x-hidden">
          <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-6">
            <div className="text-center text-gray-600">
              <p>No statistics available</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Sort statistics by order
  const sortedStatistics = [...statistics].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  return (
    <section ref={sectionRef} className="md:py-14 lg:py-16 relative">
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="max-w-[1380px] w-full mx-auto py-10  px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-4 xl:gap-6 2xl:gap-8">
          {sortedStatistics.map((stat, index) => {
            const content = getLocalizedContent(stat);
            const currentCount = counts[stat.uuid] || 0;

            // Show original value if animation hasn't started or if it's the final value
            const displayValue =
              currentCount === 0
                ? stat.value
                : formatDisplayValue(stat.value, currentCount);

            return (
              <div
                key={stat.uuid}
                className="bg-white rounded-2xl p-6 md:p-7 lg:p-5 xl:p-7 2xl:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: isVisible
                    ? "fadeInUp 0.6s ease-out forwards"
                    : "none",
                }}
              >
                <div className="text-center">
                  <h3 className="text-base md:text-[18px] lg:text-base xl:text-lg 2xl:text-xl font-semibold text-gray-800 mb-3 md:mb-4 lg:mb-3 xl:mb-4 leading-tight">
                    {content.title}
                  </h3>

                  <div className="mb-4">
                    <span className="text-3xl md:text-4xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-[#1857FE]">
                      {displayValue}
                    </span>
                  </div>

                  <p className="text-sm md:text-[16px] lg:text-sm xl:text-base 2xl:text-lg text-[#282828] leading-relaxed">
                    {content.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default Status;
