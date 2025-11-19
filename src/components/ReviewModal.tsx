import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ReviewFormData {
  description: string;
  image: File | null;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState<ReviewFormData>({
    description: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map i18n language to API language codes
  const currentLangCode = useMemo(() => {
    const lang = i18n.language;
    const langMap: Record<string, string> = {
      'uz': 'uz',
      'uz-cyrillic': 'kr',
      'uz-latin': 'uz',
      'ru': 'ru',
      'en': 'en',
      'kz': 'kz',
      'ky': 'kg',
      'tg': 'tj'
    };
    return langMap[lang] || 'uz';
  }, [i18n.language]);

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

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ description: "", image: null });
      setImagePreview(null);
      setError(null);
    }
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError(t("common.invalidImageType") || "Фақат расм файлини юклаш мумкин");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(t("common.imageTooLarge") || "Расм ҳажми 5MB дан ошмаслиги керак");
        return;
      }

      setFormData({ ...formData, image: file });
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.description.trim()) {
      setError(t("common.descriptionRequired") || "Изоҳ майдони тўлдирилиши керак");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      // Send description with language-specific key (description_uz, description_ru, description_kr, etc.)
      const descriptionKey = `description_${currentLangCode}`;
      formDataToSend.append(descriptionKey, formData.description.trim());
      
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      // Use client review-create endpoint
      await api.post("/client/review-create/", formDataToSend);

      // Success
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form and close modal
      setFormData({ description: "", image: null });
      setImagePreview(null);
      onClose();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(
        apiError?.message || t("common.submitError") || "Хатолик юз берди. Қайтадан уриниб кўринг."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label={t("common.close")}
      />

      <div className="relative z-10 flex flex-col w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            {t("reviews.showAll") || "Изох колдириш"}
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Description Field */}
          <div className="mb-4 sm:mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("common.description") || "Изоҳ"}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1857FE] focus:border-transparent resize-none"
              placeholder={t("common.descriptionPlaceholder") || "Изоҳингизни ёзинг..."}
              required
            />
          </div>

          {/* Image Upload Field */}
          <div className="mb-4 sm:mb-6">
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("common.image") || "Расм"}
            </label>
            <div className="space-y-3">
              {!imagePreview ? (
                <div className="relative">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1857FE] transition-colors duration-200 bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-10 h-10 mb-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">{t("common.clickToUpload") || "Расмни юклаш учун босинг"}</span>{" "}
                        {t("common.orDragDrop") || "ёки бу ерга тортинг"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("common.imageFormat") || "PNG, JPG, GIF (MAX. 5MB)"}
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                      aria-label={t("common.removeImage") || "Расмни олиб ташлаш"}
                    >
                      <svg
                        className="w-5 h-5"
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
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="mt-2 inline-block text-sm text-[#1857FE] hover:text-[#0d47e8] cursor-pointer font-medium"
                  >
                    {t("common.changeImage") || "Расмни ўзгартириш"}
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 sm:gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
              disabled={isSubmitting}
            >
              {t("common.cancel") || "Бекор қилиш"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-[#1857FE] text-white rounded-lg hover:bg-[#0d47e8] transition-colors duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>{t("common.submitting") || "Юборилмоқда..."}</span>
                </>
              ) : (
                <span>{t("common.submit") || "Жўнатиш"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;

