import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useSocialVideos } from "../../hooks/useSocialVideos";
import LoadingSpinner from "../LoadingSpinner";
import type { SocialVideo } from "../../services/socialVideosService";

const YoutubeSwiper = () => {
  const { t, i18n } = useTranslation();
  const { data: videos, isLoading, error } = useSocialVideos();
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [failedThumbnails, setFailedThumbnails] = useState<Set<string>>(new Set());

  const currentLangCode = useMemo(() => {
    const langMap: Record<string, string> = {
      "uz-cyrillic": "kr",
      "uz-latin": "uz",
      uz: "uz",
      ru: "ru",
      en: "en",
      tg: "tj",
      kz: "kz",
      ky: "kg",
    };
    return langMap[i18n.language] || "kr";
  }, [i18n.language]);

  const getLocalizedContent = (video: SocialVideo) => {
    return {
      title:
        (video[`title_${currentLangCode}` as keyof SocialVideo] as string) ||
        video.title_kr,
      link:
        (video[`link_${currentLangCode}` as keyof SocialVideo] as string) ||
        video.link_ru,
    };
  };

  const getYouTubeVideoId = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : "";
  };

  const getThumbnailUrl = (videoId: string): string => {
    if (failedThumbnails.has(videoId)) {
      return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }
    return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const sortedVideos = useMemo(() => {
    if (!videos) return [];
    return [...videos].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [videos]);

  const containerClass = "w-full max-w-full overflow-x-hidden";
  const innerClass = "w-full py-10 md:py-14 lg:py-16 pb-[100px] md:pb-[120px] lg:pb-[138px]";
  const contentClass = "max-w-[1380px] mx-auto px-4 sm:px-6";
  const centerClass = "flex items-center justify-center min-h-[260px] md:min-h-[340px] lg:min-h-[400px]";

  if (isLoading) {
    return (
      <div className={containerClass}>
        <div className={innerClass}>
          <div className={contentClass}>
            <div className={centerClass}>
              <LoadingSpinner size="lg" text={t("common.loading")} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClass}>
        <div className={innerClass}>
          <div className={contentClass}>
            <div className={centerClass}>
              <div className="text-center">
                <div className="text-red-500 text-4xl md:text-5xl lg:text-6xl mb-3 md:mb-4">⚠️</div>
                <h3 className="text-base md:text-lg font-semibold text-red-600 mb-2">
                  {t("common.errorOccurred")}
                </h3>
                <p className="text-sm md:text-base text-gray-600">{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className={containerClass}>
        <div className={innerClass}>
          <div className={contentClass}>
            <div className={centerClass}>
              <div className="text-center">
                <div className="text-gray-400 text-4xl md:text-5xl lg:text-6xl mb-3 md:mb-4">📹</div>
                <h3 className="text-base md:text-lg font-semibold text-gray-600 mb-2">
                  {t("common.noVideosFound")}
                </h3>
                <p className="text-sm md:text-base text-gray-500">
                  {t("common.noVideosAvailable")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className={innerClass}>
        <div className={contentClass}>
        {/* Header Section */}
        <div className="mb-8 md:mb-10 lg:mb-12">
          <h2 className="font-bold text-[#282828] relative text-left z-[1] text-2xl md:text-4xl lg:text-[54px] leading-tight lg:leading-[58px]">
            {t("common.usefulContent")}
          </h2>
          <p className="text-base md:text-xl lg:text-[27.337px] w-full md:w-[600px] text-[#282828] leading-relaxed md:leading-8 lg:leading-9 mt-2 md:mt-3">
            {t("common.usefulContentDesc")}
          </p>
        </div>

        {/* Swiper Container */}
        <div className="relative">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            pagination={{
              clickable: true,
              el: ".swiper-pagination",
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
            }}
            className="youtube-swiper"
          >
            {sortedVideos.map((video) => {
              const content = getLocalizedContent(video);
              const videoId = getYouTubeVideoId(content.link);
              const thumbnailUrl = getThumbnailUrl(videoId);

              return (
                <SwiperSlide key={video.uuid}>
                  <div className="w-full lg:max-w-[460px] mx-auto">
                    {/* Video Thumbnail */}
                    <div
                      className="relative group cursor-pointer"
                      onClick={() => window.open(content.link, "_blank")}
                      onMouseEnter={() => setHoveredVideo(video.uuid)}
                      onMouseLeave={() => setHoveredVideo(null)}
                    >
                      <div className="relative w-full h-48 md:h-56 lg:h-64 bg-black/10 rounded-xl md:rounded-2xl overflow-hidden">
                        <img
                          src={thumbnailUrl}
                          alt={content.title}
                          className={`w-full h-full object-cover transition-all duration-300 ${
                            hoveredVideo === video.uuid
                              ? "scale-105"
                              : "scale-100"
                          }`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            setFailedThumbnails(prev => new Set(prev).add(videoId));
                            const fallbackUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                            if (target.src !== fallbackUrl && !target.src.includes('hqdefault')) {
                              target.src = fallbackUrl;
                            } else {
                              target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDYwIiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlZpZGVvIFRodW1ibmFpbDwvdGV4dD48L3N2Zz4=";
                            }
                          }}
                        />

                        {/* Play Button Overlay */}
                        <div
                          className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-all duration-300 ${
                            hoveredVideo === video.uuid
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        >
                          <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                            <svg
                              className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-[#1857FE] ml-1"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="mt-3 md:mt-4 flex gap-3">
                      {/* Channel Avatar */}
                      <div className="w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 bg-white rounded-full border border-sky-500 flex-shrink-0 overflow-hidden">
                        <img
                          src="https://main.yp.uz/uploads/organizations/logo/4899f97496879629748510cec48b663e.jpg"
                          alt="Channel avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDQiIGhlaWdodD0iNDQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjIiIGN5PSIyMiIgcj0iMjIiIGZpbGw9IiNjY2NjY2MiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QzwvdGV4dD48L3N2Zz4=";
                          }}
                        />
                      </div>

                      {/* Video Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg lg:text-xl font-medium text-stone-950 leading-6 md:leading-7 mb-1.5 md:mb-2 line-clamp-2">
                          {content.title}
                        </h3>

                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-zinc-600 text-sm md:text-base lg:text-lg font-normal">
                            koznuri_clinic
                          </span>
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-zinc-600 rounded-full"></div>
                        </div>

                        <div className="flex items-center gap-2 text-zinc-600 text-sm md:text-base lg:text-lg">
                          <span>YouTube</span>
                          <span>•</span>
                          <span>Ko'z nuri klinikasi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <div className="swiper-pagination !relative !mt-6 md:!mt-8"></div>
        </div>

        {/* YouTube Button */}
        <div className="flex justify-center mt-8 md:mt-10 lg:mt-12">
          <button
            onClick={() =>
              window.open("https://youtube.com/@koznuri_clinic", "_blank")
            }
            className="px-10 py-4 lg:h-20 bg-[#1857FE] rounded-[5px] shadow-[0px_17px_27px_0px_rgba(24,87,254,0.30)] flex items-center justify-center gap-3 md:gap-4 hover:bg-[#0d47e8] transition-colors duration-200 group"
          >
            <div className="w-8 h-6 md:w-10 md:h-7 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="23"
                viewBox="0 0 39 28"
                fill="none"
              >
                <g clipPath="url(#clip0_1962_14715)">
                  <path
                    d="M22.8679 13.7063L16.7111 17.1329V10.2798L22.8679 13.7063Z"
                    fill="white"
                    stroke="white"
                    strokeWidth="2.41875"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M1.75897 14.9193V12.4933C1.75897 7.53334 1.75897 5.05251 3.35095 3.45744C4.94469 1.86066 7.45315 1.79213 12.4683 1.65336C14.8431 1.58825 17.2706 1.54199 19.3499 1.54199C21.4291 1.54199 23.8549 1.58825 26.2314 1.65336C31.2466 1.79213 33.7551 1.86066 35.3471 3.45744C36.939 5.05422 36.9408 7.53505 36.9408 12.4933V14.9176C36.9408 19.8792 36.9408 22.3584 35.3488 23.9551C33.7551 25.5502 31.2484 25.6204 26.2314 25.7575C23.8567 25.8243 21.4291 25.8706 19.3499 25.8706C17.2706 25.8706 14.8448 25.8243 12.4683 25.7575C7.45315 25.6204 4.94469 25.5519 3.35095 23.9551C1.75721 22.3584 1.75897 19.8775 1.75897 14.9193Z"
                    stroke="white"
                    strokeWidth="3.3461"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1962_14715">
                    <rect width="38.1961" height="27.779" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <span className="text-white text-base md:text-lg lg:text-[20px]">{t("common.goToYouTube")}</span>
          </button>
        </div>

        <style>{`
          .youtube-swiper .swiper-pagination-bullet {
            background: #1857FE;
            opacity: 0.3;
          }
          .youtube-swiper .swiper-pagination-bullet-active {
            opacity: 1;
          }
        `}</style>
        </div>
      </div>
    </div>
  );
};

export default YoutubeSwiper;
