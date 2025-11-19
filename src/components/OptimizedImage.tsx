import React, { useState, useCallback } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(
  ({ src, alt, className = "", onLoad, onError }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback(() => {
      setIsLoading(false);
      onLoad?.();
    }, [onLoad]);

    const handleError = useCallback(() => {
      setIsLoading(false);
      setHasError(true);
      onError?.();
    }, [onError]);

    if (hasError) {
      return (
        <div
          className={`bg-gray-200 flex items-center justify-center ${className}`}
        >
          <div className="text-center text-gray-500">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Rasm yuklanmadi</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1857FE]"></div>
          </div>
        )}
        <img
          src={
            src.startsWith("http") ? src : `https://koznuri.novacode.uz${src}`
          }
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;
