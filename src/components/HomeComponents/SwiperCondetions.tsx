import { useState, useEffect, useRef, useMemo } from 'react';
import { useGallery } from '../../hooks/useGallery';
import LoadingSpinner from '../LoadingSpinner';

const SwiperCondetions = () => {
  const { data: galleryImages, isLoading, isError } = useGallery();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [slidesToShow, setSlidesToShow] = useState(4);
  const intervalRef = useRef<number | null>(null);

  // Sort images by order and construct full URLs
  const images = useMemo(() => {
    if (!galleryImages) return [];
    
    return galleryImages
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        uuid: item.uuid,
        url: item.image.startsWith('http') 
          ? item.image 
          : `https://koznuri.novacode.uz${item.image}`,
      }));
  }, [galleryImages]);

  // Responsive slides per view
  useEffect(() => {
    const recalc = () => {
      const w = window.innerWidth;
      if (w < 640) setSlidesToShow(1); // mobile: 1 slide
      else if (w < 768) setSlidesToShow(2); // sm: 2 slides
      else if (w < 1024) setSlidesToShow(3); // md: 3 slides
      else if (w < 1280) setSlidesToShow(4); // lg: 4 slides
      else setSlidesToShow(5); // xl+: 5 slides
    };
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  const totalPositions = Math.max(1, images.length - slidesToShow + 1);
  const shouldAutoPlay = images.length > slidesToShow;

  // Auto-play functionality - only if more than 4 images
  useEffect(() => {
    if (shouldAutoPlay && !isHovered && totalPositions > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPositions);
      }, 3000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, shouldAutoPlay, totalPositions]);

  const openModal = (image: string) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const goToNext = () => {
    if (shouldAutoPlay && totalPositions > 1) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPositions);
    }
  };

  const goToPrevious = () => {
    if (shouldAutoPlay && totalPositions > 1) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + totalPositions) % totalPositions);
    }
  };

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbGxlcnkgSW1hZ2U8L3RleHQ+PC9zdmc+';
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-8 md:py-12 lg:py-16">
        <div className="w-full max-w-full overflow-x-hidden">
          <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center min-h-[300px]">
              <LoadingSpinner size="lg" text="Galereya yuklanmoqda..." />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (isError || !images.length) {
    return (
      <section className="py-8 md:py-12 lg:py-16">
        <div className="w-full max-w-full overflow-x-hidden">
          <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="text-center text-gray-500">
                <p className="text-lg">Galereya rasmlari yuklanmadi</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-8 md:py-12 lg:py-16">
        <div className="w-full max-w-full overflow-x-hidden">
          <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div 
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Main carousel container */}
              <div className="overflow-hidden rounded-lg">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ 
                    transform: shouldAutoPlay 
                      ? `translateX(-${currentIndex * (100 / slidesToShow)}%)` 
                      : 'translateX(0%)',
                  }}
                >
                  {images.map((image, index) => (
                    <div
                      key={image.uuid}
                      className="flex-shrink-0 px-1.5 sm:px-2 md:px-2.5 lg:px-3"
                      style={{ flex: `0 0 ${100 / slidesToShow}%` }}
                    >
                      <div
                        className="relative group cursor-pointer overflow-hidden rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105"
                        onClick={() => openModal(image.url)}
                      >
                        <img
                          src={image.url}
                          alt={`Gallery Image ${index + 1}`}
                          className="w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 2xl:h-[340px] object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={handleImageError}
                          loading="lazy"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation arrows - only show if more slides than visible */}
              {shouldAutoPlay && totalPositions > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-1.5 sm:p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                    aria-label="Previous image"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={goToNext}
                    className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-1.5 sm:p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                    aria-label="Next image"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
          onClick={closeModal}
        >
          <div 
            className="relative max-w-4xl sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Modal Image"
              className="w-full h-auto max-h-[85vh] sm:max-h-[90vh] object-contain rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl"
              onError={handleImageError}
            />
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 lg:top-6 lg:right-6 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 sm:p-2.5 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SwiperCondetions;