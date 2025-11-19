import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getNews } from "../../services/apiNewsService";
import type { NewsItem } from "../../types/News";
import { sanitizeHtml } from "../../utils/sanitize";
import { mapI18nToApiLanguage } from "../../utils/languageMapper";
import { useApp } from "../../context/AppContext";

export default function News() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getNews(4); // Last 4 news items
        setNewsItems(data);
      } catch (err) {
        const errorMessage = i18n.t("news.error") as string || "Xatolik yuz berdi";
        setError(errorMessage);
        addNotification({
          type: "error",
          title: t("common.error") as string || "Xatolik",
          message: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [i18n]);

  const getCurrentLanguage = () => {
    return mapI18nToApiLanguage(i18n.language);
  };

  const getTitle = (item: NewsItem) => {
    const lang = getCurrentLanguage();
    const langKey = `title_${lang}` as keyof NewsItem;
    return item[langKey] as string || item.title_uz;
  };

  const getDescription = (item: NewsItem) => {
    const lang = getCurrentLanguage();
    const langKey = `description_${lang}` as keyof NewsItem;
    return item[langKey] as string || item.description_uz;
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="w-full max-w-[1380px] h-auto relative mx-auto my-0 px-4 sm:px-5 md:px-6 pb-12 md:pb-[130px]">
      <div className="flex w-full max-w-[749px] flex-col gap-3 md:gap-[25px] items-start flex-nowrap relative mt-4 md:mt-[19px] mr-0 mb-0 ml-0">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[54px] font-bold leading-tight md:leading-[58px] text-[#282828] relative text-left z-[1]">
          {i18n.t("news.title")}
        </h2>
        <p className="flex w-full text-base sm:text-lg md:text-2xl lg:text-[27px] font-normal leading-6 sm:leading-7 md:leading-[35px] text-[#282828] relative text-left z-[2]">
          {i18n.t("news.subtitle")}
        </p>
      </div>

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-[21px] mt-8 md:mt-[50px] mb-10 md:mb-12 w-full">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="w-full h-[460px] md:h-[519px] bg-white rounded-[20px] shadow-lg overflow-hidden animate-pulse"
            >
              <div className="w-full h-[200px] sm:h-[220px] md:h-[264px] bg-gray-300 rounded-[10px]"></div>
              <div className="p-4">
                <div className="h-5 md:h-6 bg-gray-300 rounded mb-3 md:mb-4"></div>
                <div className="h-3 md:h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 md:h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 md:h-4 bg-gray-300 rounded mb-3 md:mb-4"></div>
                <div className="h-3 md:h-4 bg-gray-300 rounded w-16 md:w-20"></div>
              </div>
            </div>
          ))
        ) : error ? (
          // Error state
          <div className="col-span-full flex flex-col items-center justify-center py-10 md:py-12 px-4 text-center">
            <div className="text-red-500 text-lg md:text-xl mb-3 md:mb-4">⚠️</div>
            <p className="text-red-600 text-base md:text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 md:px-6 md:py-2 bg-[#1857fe] text-white rounded hover:bg-[#0d47e8] transition-colors"
            >
              {i18n.t("common.retry")}
            </button>
          </div>
        ) : (
          newsItems.map((item: NewsItem) => (
            <div
              key={item.uuid}
              className="w-full min-h-[460px] md:min-h-[519px] h-full bg-white rounded-[20px] shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col"
            >
              {/* News Image */}
              <div className="w-full h-[200px] sm:h-[220px] md:h-[264px] flex-shrink-0 relative overflow-hidden">
                <img
                  src={
                    item.image.startsWith("http")
                      ? item.image
                      : `https://koznuri.novacode.uz${item.image}`
                  }
                  alt={getTitle(item)}
                  className="w-full h-full object-cover rounded-[10px] group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI2NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5ld3MgSW1hZ2U8L3RleHQ+PC9zdmc+";
                  }}
                />
                {/* Category Badge */}
                {/* <div className="absolute top-3 left-3 bg-[#1857fe] text-white px-2 py-1 rounded text-sm font-medium">
                {item.category}
              </div> */}
              </div>

              {/* News Content */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg md:text-[20px] font-bold leading-5 md:leading-[22px] text-[#282828] mb-3 md:mb-4 line-clamp-2">
                  {getTitle(item)}
                </h3>
                <div 
                  className="text-sm sm:text-base md:text-[18px] font-normal leading-5 md:leading-[20px] text-[#757575] mb-3 md:mb-4 line-clamp-3 flex-1"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(getDescription(item)) }}
                />

                {/* Publish Date */}
                <p className="text-xs md:text-[14px] text-gray-400 mb-3 md:mb-4 flex-shrink-0">
                  {new Date(item.date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'uz-UZ', {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                {/* Read More Button - Always at bottom */}
                <div className="mt-auto pt-2 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/news/${item.uuid}`)}
                    className="text-sm md:text-[18px] font-normal text-[#1857fe] hover:text-[#0d47e8] transition-colors inline-block cursor-pointer"
                  >
                    {i18n.t("common.readMore")}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Call to Action Button */}
      <div className="flex justify-center mt-10 md:mt-12 px-4">
        <button 
          onClick={() => navigate('/news')}
          className="w-full h-14 md:w-[349px] md:h-[82px] bg-[#1857fe] rounded-[5px] shadow-[0_17px_27px_0_rgba(24,87,254,0.3)] flex items-center justify-center hover:bg-[#0d47e8] transition-colors duration-200"
        >
          <span className="text-base md:text-[20px] font-bold text-white">
            {i18n.t("news.showAll")}
          </span>
        </button>
      </div>
      </div>
    </div>
  );
}
