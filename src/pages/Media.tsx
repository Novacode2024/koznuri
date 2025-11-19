import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import AllHeader from "../components/AllHeader";
import YoutubeSwiper from "../components/HomeComponents/YoutubeSwiper";
import ImageModal from "../components/ImageModal";
import LoadingSpinner from "../components/LoadingSpinner";
import SEO from "../components/SEO";
import { useGallery } from "../hooks/useGallery";

const Media = () => {
  const { t } = useTranslation();
  const { data: galleryImages, isLoading, error } = useGallery();
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);

  const handleImageClick = (imageUrl: string, alt: string) => {
    setSelectedImage({ url: imageUrl, alt });
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (isLoading) {
    return (
      <>
        <AllHeader title={t("common.gallery")} link="/media" />
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
        <AllHeader title={t("common.gallery")} link="/media" />
        <div className="max-w-[1380px] mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              {t("common.errorOccurred")}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{error.message}</p>
          </div>
        </div>
      </>
    );
  }

  if (!galleryImages || galleryImages.length === 0) {
    return (
      <>
        <AllHeader title={t("common.gallery")} link="/media" />
        <div className="max-w-[1380px] mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📸</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {t("common.noImagesFound")}
            </h3>
            <p className="text-sm text-gray-500">
              {t("common.noImagesAvailable")}
            </p>
          </div>
        </div>
      </>
    );
  }

  // Sort images by order
  const sortedImages = [...galleryImages].sort((a, b) => a.order - b.order);

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": t("common.gallery") || "Galereya",
    "description": "Ko'z Nuri klinikasi galereyasi - ko'z tibbiy xizmatlari, operatsiyalar va klinika hayotidan rasmlar.",
    "url": "https://koznuri.novacode.uz/media",
    "image": sortedImages.slice(0, 10).map(img => ({
      "@type": "ImageObject",
      "url": img.image.startsWith("http") ? img.image : `https://koznuri.novacode.uz${img.image}`
    }))
  }), [sortedImages, t]);

  return (
    <>
      <SEO
        title={`${t("common.gallery")} | Ko'z Nuri`}
        description="Ko'z Nuri klinikasi galereyasi - ko'z tibbiy xizmatlari, operatsiyalar va klinika hayotidan rasmlar. Toshkent, O'zbekiston."
        keywords="ko'z tibbiy markazi galereyasi, ko'z operatsiyalari, oftalmologiya rasmlari, Toshkent"
        canonical="https://koznuri.novacode.uz/media"
        structuredData={structuredData}
      />
      <AllHeader title={t("common.gallery")} link="/media" />
      <div className="max-w-[1380px] mx-auto px-4 py-8">
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedImages.map((image, index) => {
            // First image takes 2 rows
            if (index === 0) {
              return (
                <div
                  key={image.uuid}
                  className="md:row-span-2 cursor-pointer group"
                  onClick={() =>
                    handleImageClick(
                      image.image.startsWith("http")
                        ? image.image
                        : `https://koznuri.novacode.uz${image.image}`,
                      `Gallery image ${index + 1}`
                    )
                  }
                >
                  <div className="relative w-full h-64 md:h-full rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <img
                      src={
                        image.image.startsWith("http")
                          ? image.image
                          : `https://koznuri.novacode.uz${image.image}`
                      }
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbGxlcnkgSW1hZ2U8L3RleHQ+PC9zdmc+";
                      }}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg
                          className="w-12 h-12 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Other images take 1 row each
            return (
              <div
                key={image.uuid}
                className="cursor-pointer group"
                onClick={() =>
                  handleImageClick(
                    image.image.startsWith("http")
                      ? image.image
                      : `https://koznuri.novacode.uz${image.image}`,
                    `Gallery image ${index + 1}`
                  )
                }
              >
                <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <img
                    src={
                      image.image.startsWith("http")
                        ? image.image
                        : `https://koznuri.novacode.uz${image.image}`
                    }
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbGxlcnkgSW1hZ2U8L3RleHQ+PC9zdmc+";
                    }}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* YouTube Videos Section */}
      <div className="max-w-[1380px] mx-auto px-4 py-8">
        <YoutubeSwiper />
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={closeModal}
          imageUrl={selectedImage.url}
          alt={selectedImage.alt}
        />
      )}
    </>
  );
};

export default Media;
