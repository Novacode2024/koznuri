import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AllHeader from "../components/AllHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import SEO from "../components/SEO";
import api from "../services/api";
import { sanitizeHtml } from "../utils/sanitize";

// Types
interface Hashtag {
  uuid: string;
  title_uz: string;
}

interface NewsItem {
  uuid: string;
  title_uz: string;
  description_uz: string;
  image: string;
  hashtags: Hashtag[];
  date: string;
  order: number;
}

// News Card Component
const NewsCard: React.FC<{ item: NewsItem }> = ({ item }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white group relative rounded-lg shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out">
      {/* Image */}
      <div className="relative h-[400px]">
        <img
          src={
            item.image.startsWith("http")
              ? item.image
              : `https://koznuri.novacode.uz${item.image}`
          }
          alt={item.title_uz}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5ld3MgSW1hZ2U8L3RleHQ+PC9zdmc+";
          }}
        />
      </div>

      {/* Content */}
      <div className="absolute -bottom-[40%] left-0 right-0 p-4  bg-black/30 text-white backdrop-blur-sm rounded-lg group-hover:bottom-0 transition-all duration-300">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
          {item.title_uz}
        </h3>
        <div
          className="text-sm mb-3 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description_uz) }}
        />

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {item.hashtags.map((hashtag) => (
            <span
              key={hashtag.uuid}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {hashtag.title_uz}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-white">
            {new Date(item.date).toLocaleDateString("uz-UZ")}
          </span>
          <Link
            to={`/news/${item.uuid}`}
            className="bg-[#1857FE] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0d47e8] transition-colors duration-200"
          >
            {t("common.readMore")}
          </Link>
        </div>
      </div>
    </div>
  );
};

const NewsPage = () => {
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [allHashtags, setAllHashtags] = useState<Hashtag[]>([]);

  // Fetch news data
  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<NewsItem[]>("/news/");

      setNews(response);
      setFilteredNews(response);

      // Extract unique hashtags
      const hashtags: Hashtag[] = [];
      response.forEach((item) => {
        item.hashtags.forEach((hashtag) => {
          if (!hashtags.find((h) => h.uuid === hashtag.uuid)) {
            hashtags.push(hashtag);
          }
        });
      });
      setAllHashtags(hashtags);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  // Filter news by hashtag
  const filterByHashtag = (hashtagTitle: string) => {
    if (selectedHashtag === hashtagTitle) {
      // Reset filter
      setSelectedHashtag(null);
      setFilteredNews(news);
    } else {
      // Apply filter
      setSelectedHashtag(hashtagTitle);
      const filtered = news.filter((item) =>
        item.hashtags.some((hashtag) => hashtag.title_uz === hashtagTitle)
      );
      setFilteredNews(filtered);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Move useMemo before early returns to follow Rules of Hooks
  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": t("common.news") || "Yangiliklar",
    "description": "Ko'z Nuri klinikasi yangiliklari - ko'z tibbiy sohasidagi eng so'nggi yangiliklar, maqolalar va e'lonlar.",
    "url": "https://koznuri.novacode.uz/news",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": filteredNews.length,
      "itemListElement": filteredNews.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "NewsArticle",
          "headline": item.title_uz,
          "url": `https://koznuri.novacode.uz/news/${item.uuid}`
        }
      }))
    }
  }), [filteredNews, t]);

  if (loading) {
    return (
      <>
        <AllHeader title={t("common.news")} link="/news" />
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
        <AllHeader title={t("common.news")} link="/news" />
        <div className="max-w-[1380px] mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              {t("common.errorOccurred")}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchNews}
              className="px-4 py-2 bg-[#1857FE] text-white rounded hover:bg-blue-700 transition-colors duration-200"
            >
              {t("common.retry")}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${t("common.news") || "Yangiliklar"} | Ko'z Nuri`}
        description="Ko'z Nuri klinikasi yangiliklari - ko'z tibbiy sohasidagi eng so'nggi yangiliklar, maqolalar va e'lonlar. Toshkent, O'zbekiston."
        keywords="ko'z tibbiy yangiliklari, oftalmologiya yangiliklari, ko'z kasalliklari, Toshkent, yangiliklar"
        canonical="https://koznuri.novacode.uz/news"
        structuredData={structuredData}
      />
      <AllHeader title={t("common.news")} link="/news" />
      <div className="max-w-[1380px] mx-auto px-4 py-8">
        {/* Hashtag Filters */}
        {allHashtags.length > 0 && (
          <div className="mb-8 mt-10">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("common.filters")}:
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedHashtag(null);
                  setFilteredNews(news);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedHashtag === null
                    ? "bg-[#1857FE] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {t("common.all")}
              </button>
              {allHashtags.map((hashtag) => (
                <button
                  key={hashtag.uuid}
                  onClick={() => filterByHashtag(hashtag.title_uz)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    selectedHashtag === hashtag.title_uz
                      ? "bg-[#1857FE] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {hashtag.title_uz}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* News Grid */}
        {filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📰</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {t("common.noNewsFound")}
            </h3>
            <p className="text-sm text-gray-500">
              {selectedHashtag
                ? t("news.noNewsForHashtag", { hashtag: selectedHashtag })
                : t("common.noNewsAvailable")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item) => (
              <NewsCard key={item.uuid} item={item} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default NewsPage;
