import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
}

const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  documentUrl,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Get full document URL
  const getFullDocumentUrl = (): string => {
    if (documentUrl.startsWith("http")) {
      return documentUrl;
    }
    // Use Google Docs viewer for .docx files
    if (documentUrl.endsWith(".docx")) {
      const fullUrl = `https://koznuri.novacode.uz${documentUrl}`;
      return `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
    }
    return `https://koznuri.novacode.uz${documentUrl}`;
  };

  // Get download URL
  const getDownloadUrl = (): string => {
    if (documentUrl.startsWith("http")) {
      return documentUrl;
    }
    return `https://koznuri.novacode.uz${documentUrl}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label={t("common.close")}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-6xl max-h-[95vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-20">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            {t("common.usageGuide") || "Фойдаланиш кўлланмаси"}
          </h2>
          <div className="flex items-center gap-3">
            {/* Download Button */}
            <a
              href={getDownloadUrl()}
              download
              className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#1857FE] text-white rounded-lg hover:bg-[#0d47e8] transition-colors duration-200 text-sm font-medium"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>{t("common.download")}</span>
            </a>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
              aria-label={t("common.close")}
            >
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="flex-1 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1857FE] border-t-transparent mb-4"></div>
                <p className="text-gray-600 text-sm">
                  {t("common.loading") || "Юкланмоқда..."}
                </p>
              </div>
            </div>
          )}
          <iframe
            src={getFullDocumentUrl()}
            className="w-full h-full min-h-[400px] sm:min-h-[500px] md:min-h-[600px]"
            title={t("common.usageGuide") || "Фойдаланиш кўлланмаси"}
            allow="fullscreen"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>

        {/* Mobile Download Button */}
        <div className="sm:hidden border-t border-gray-200 px-4 py-3 bg-gray-50">
          <a
            href={getDownloadUrl()}
            download
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#1857FE] text-white rounded-lg hover:bg-[#0d47e8] transition-colors duration-200 text-sm font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>{t("common.download") || "Юклаб олиш"}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;

