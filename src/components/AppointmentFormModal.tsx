import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppointmentForm } from "./HomeComponents/Contact";

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

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
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label={t("common.close")}
      />

      <div className="relative z-10 flex flex-col w-full max-w-5xl max-h-[95vh] bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            {t("contact.title") || "Қабулга ёзилиш"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
            aria-label={t("common.close")}
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
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

        {/* Content - AppointmentForm */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          <div className="max-w-full">
            <AppointmentForm hideTitle={true} onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentFormModal;

