import React, {  useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useGuideById } from "../hooks/useGuides";
import { localizeGuide } from "../services/guidesService";
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

const UsageGuideDetail: React.FC = () => {
  const { uuid = "" } = useParams<{ uuid: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const locale = useMemo<ServiceLocale>(() => {
    return LANGUAGE_MAP[i18n.language] || "kr";
  }, [i18n.language]);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGuideById(uuid, Boolean(uuid));

  const guide = useMemo(() => {
    return data ? localizeGuide(data, locale) : null;
  }, [data, locale]);



  const videoEmbedUrl =
    guide && guide.videoUrl && guide.videoUrl.includes("youtu")
      ? buildYoutubeEmbedUrl(guide.videoUrl)
      : guide?.videoUrl ?? "";

  return (
    <div className="py-10 sm:py-14">
      <div className="max-w-[900px] w-full mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#1857FE] hover:text-[#0d47e8] transition-colors duration-200"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t("common.back")}
            </button>
            <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900">
              {guide?.title || t("common.usageGuide")}
            </h1>
            {guide?.description && (
              <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
                {guide.description}
              </p>
            )}
          </div>
          {guide?.fileUrl && (
            <a
              href={guide.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 self-start whitespace-nowrap rounded-lg bg-[#1857FE] px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0d47e8]"
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

        <div className="mt-8 sm:mt-10 space-y-6 sm:space-y-8">
          {isLoading && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white py-16 shadow-sm text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1857FE] border-t-transparent" />
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

          {!isLoading && !isError && !guide && (
            <div className="rounded-3xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
              <p className="text-sm text-gray-600">
                {t("common.nothingFound", "Ma'lumot topilmadi")}
              </p>
            </div>
          )}

          {guide && !isLoading && !isError && (
            <>
              {guide.videoUrl && (
                <div className="overflow-hidden rounded-3xl border border-gray-200 bg-black/5 shadow-sm">
                  <div className="relative w-full pb-[56.25%]">
                    {guide.videoUrl.includes("youtu") ? (
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
                        src={guide.videoUrl}
                      />
                    )}
                  </div>
                </div>
              )}

             
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsageGuideDetail;


