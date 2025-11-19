import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

interface NewsDetail {
  uuid: string;
  title_uz: string;
  description_uz: string;
  image: string;
  hashtags: Hashtag[];
  date: string;
  order: number;
}

const NewsDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch news detail
  const fetchNewsDetail = useCallback(async () => {
    if (!id) {
      setError(t("common.newsIdNotFound"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get<NewsDetail>(`/new/${id}/`);

      setNews(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.errorOccurred"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchNewsDetail();
  }, [fetchNewsDetail]);

  if (loading) {
    return (
      <>
        <AllHeader title={t("common.news")} link="/news" />
        <div className="max-w-[1000px] mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" text={t("common.loading")} />
          </div>
        </div>
      </>
    );
  }

  if (error || !news) {
    return (
      <>
        <AllHeader title={t("common.news")} link="/news" />
        <div className="max-w-[1000px] mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              {t("common.errorOccurred")}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {error || t("common.newsNotFound")}
            </p>
            <button
              onClick={() => navigate("/news")}
              className="px-4 py-2 bg-[#1857FE] text-white rounded hover:bg-blue-700 transition-colors duration-200"
            >
              {t("common.backToNews")}
            </button>
          </div>
        </div>
      </>
    );
  }

  // Structured data for news article
  const newsStructuredData = useMemo(() => {
    if (!news) return null;
    
    const imageUrl = news.image.startsWith("http")
      ? news.image
      : `https://koznuri.novacode.uz${news.image}`;
    
    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": news.title_uz,
      "description": news.description_uz.substring(0, 200),
      "image": imageUrl,
      "datePublished": news.date,
      "dateModified": news.date,
      "author": {
        "@type": "Organization",
        "name": "Ko'z Nuri - Eye Medical Center"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Ko'z Nuri - Eye Medical Center",
        "logo": {
          "@type": "ImageObject",
          "url": "https://koznuri.novacode.uz/logo.svg"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://koznuri.novacode.uz/news/${news.uuid}`
      }
    };
  }, [news]);

  return (
    <>
      {news && (
        <SEO
          title={`${news.title_uz} | Ko'z Nuri Yangiliklar`}
          description={news.description_uz.substring(0, 160)}
          keywords={news.hashtags.map(h => h.title_uz).join(", ") + ", ko'z tibbiy markazi, yangiliklar, Toshkent"}
          image={news.image.startsWith("http") ? news.image : `https://koznuri.novacode.uz${news.image}`}
          type="article"
          canonical={`https://koznuri.novacode.uz/news/${news.uuid}`}
          structuredData={newsStructuredData}
        />
      )}
      <AllHeader title={t("common.news")} link="/news" />
      <div className="max-w-[1380px] mx-auto px-4 py-8 bg-[#F5F8FF] p-[38px] my-[84px] rounded-[20px]">
        {/* Main Title Section */}
        <div className="mb-12">
          <h1 className="text-[32px] font-bold text-gray-800 mb-6 leading-tight">
            {news.title_uz}
          </h1>

          {/* Date and Hashtags */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm text-gray-600">
                {new Date(news.date).toLocaleDateString("uz-UZ", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Hashtags */}
            {news.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {news.hashtags.map((hashtag) => (
                  <span
                    key={hashtag.uuid}
                    className="bg-[#F5F8FF] text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {hashtag.title_uz}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Main Image */}
          <div className="w-full h-[500px] rounded-[20px] overflow-hidden mb-8">
            <img
              src={
                news.image.startsWith("http")
                  ? news.image
                  : `https://koznuri.novacode.uz${news.image}`
              }
              alt={news.title_uz}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5ld3MgSW1hZ2U8L3RleHQ+PC9zdmc+";
              }}
            />
          </div>

          {/* Content */}
          <div className="w-full">
            <div
              className="text-lg text-gray-700 leading-relaxed prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(news.description_uz) }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsDetail;
