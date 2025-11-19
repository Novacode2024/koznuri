import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useGuides } from "../hooks/useGuides";
import {
  localizeGuide,
  type LocalizedGuide,
} from "../services/guidesService";
import type { ServiceLocale } from "../services/servicesService";
import { buildYoutubeEmbedUrl } from "../utils/media";

const LANGUAGE_MAP: Record<string, ServiceLocale> = {
  uz: "uz",
  "uz-latin": "uz",
  "uz-cyrillic": "kr",
  ru: "ru",
  en: "en",
  kz: "kz",
  ky: "kg",
  tg: "tj",
};

const UsageGuides: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGuides();

  const locale = useMemo<ServiceLocale>(() => {
    return LANGUAGE_MAP[i18n.language] || "kr";
  }, [i18n.language]);

  const guides = useMemo<LocalizedGuide[]>(() => {
    if (!data || data.length === 0) {
      return [];
    }

    return [...data]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((guide) => localizeGuide(guide, locale));
  }, [data, locale]);

  // Get first video URL from guides
  const firstVideoUrl = useMemo<string | null>(() => {
    if (!guides || guides.length === 0) {
      return null;
    }
    
    // Find first guide with video
    const guideWithVideo = guides.find((guide) => guide.videoUrl && guide.videoUrl.trim() !== '');
    return guideWithVideo?.videoUrl || null;
  }, [guides]);

  return (
    <div className="py-10 sm:py-14">
      <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-6">
        <header className="text-center sm:text-left">
          <span className="inline-flex items-center rounded-full bg-[#1857FE]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#1857FE]">
            {t("common.usageGuide")}
          </span>
          <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            {t("common.usefulContent")}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl">
            {t("common.usefulContentDesc")}
          </p>
        </header>

        <section className="mt-10 sm:mt-14 space-y-6 sm:space-y-8">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#1857FE] border-t-transparent" />
              <p className="mt-4 text-sm text-gray-600">
                {t("common.loading")}
              </p>
            </div>
          )}

          {isError && (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center shadow-sm">
              <p className="text-sm text-red-600 mb-4">
                {t("common.errorOccurred")}
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1857FE] px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0d47e8]"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.5 12a7.5 7.5 0 0113.347-4.735M19.5 12a7.5 7.5 0 01-13.347 4.735M12 6v6l3 3"
                  />
                </svg>
                {t("common.retry")}
              </button>
            </div>
          )}

          {!isLoading && !isError && guides.length === 0 && (
            <div className="rounded-3xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
              <p className="text-sm text-gray-600">
                {t("common.noServicesFound")}
              </p>
            </div>
          )}

          {guides.map((guide, index) => {
            const isEven = index % 2 === 0;
            const hasVideo = Boolean(firstVideoUrl);
            const videoEmbedUrl =
              firstVideoUrl && firstVideoUrl.includes("youtu")
                ? buildYoutubeEmbedUrl(firstVideoUrl)
                : firstVideoUrl ?? "";

            return (
              <article
                key={guide.uuid}
                className={`flex flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-5 sm:p-7 lg:p-9 shadow-sm transition-shadow duration-200 hover:shadow-lg ${
                  hasVideo ? (isEven ? "lg:flex-row" : "lg:flex-row-reverse") : ""
                }`}
              >
                <div className="flex flex-1 flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <span className="inline-flex w-fit items-center rounded-full bg-[#1857FE]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1857FE]">
                      {t("common.usageGuide")} 
                    </span>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                      {guide.title}
                    </h2>
                  </div>
                  {guide.description && (
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {guide.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => navigate(`/usage/${guide.uuid}`)}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#1857FE] px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0d47e8]"
                    >
                      <svg
                        className="h-4 w-4"
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
                      {t("common.view")}
                    </button>
                    {guide.fileUrl && (
                      <a
                        href={guide.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-[#1857FE] px-4 py-2 text-sm font-semibold text-[#1857FE] transition-colors duration-200 hover:bg-[#1857FE]/10"
                      >
                            <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4-4 4m0 0-4-4m4 4V4"
                />
              </svg>
                        {t("common.download")}
                      </a>
                    )}
                  </div>
                </div>

                {hasVideo && (
                  <div className="flex-1">
                    <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-black/5 shadow-inner">
                      <div className="relative w-full pb-[56.25%]">
                        {firstVideoUrl ? (
                          firstVideoUrl.includes("youtu") ? (
                            <iframe
                              src={videoEmbedUrl}
                              title={guide.title}
                              className="absolute inset-0 h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              controls
                              className="absolute inset-0 h-full w-full object-cover"
                              src={firstVideoUrl}
                            />
                          )
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default UsageGuides;


