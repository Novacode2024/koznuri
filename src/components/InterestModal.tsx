import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { interestService, type CreateInterestData } from "../services/interestService";
import { useApp } from "../context/AppContext";
import { useFormValidation } from "../hooks/useFormValidation";
import { useReCaptcha } from "../hooks/useReCaptcha";

interface InterestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InterestModal: React.FC<InterestModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { addNotification } = useApp();
  const { getCaptchaToken } = useReCaptcha();
  const [formData, setFormData] = useState<CreateInterestData>({
    full_name: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { errors, validateField, validateForm, clearErrors } = useFormValidation({
    full_name: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    phone: {
      required: true,
      pattern: /^\+998[0-9]{9}$/,
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 1000,
    },
  });

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
      setFormData({
        full_name: "",
        phone: "",
        message: "",
      });
      setError(null);
      clearErrors();
    }
  }, [isOpen, clearErrors]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    
    // Validate field on change
    if (errors[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm(formData as unknown as Record<string, string>)) {
      setError(t("common.fillAllFields") || "Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    setIsSubmitting(true);

    try {
      const captchaToken = await getCaptchaToken();
      await interestService.createInterest(formData, captchaToken);

      addNotification({
        type: "success",
        title: t("common.success") || "Muvaffaqiyatli",
        message: t("common.interestSubmitted") || "Qiziqish bildirildi. Tez orada siz bilan bog'lanamiz.",
        duration: 5000,
      });

      // Reset form and close modal
      setFormData({
        full_name: "",
        phone: "",
        message: "",
      });
      onClose();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(
        apiError?.message || t("common.submitError") || "Xatolik yuz berdi. Qaytadan urinib ko'ring."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
          aria-label={t("common.close")}
        />

        <motion.div
          className="relative z-10 flex flex-col w-full max-w-lg max-h-[95vh] bg-white rounded-lg shadow-2xl overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              {t("common.showInterest")}
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <motion.div
                  className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              {/* Full Name */}
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("common.fullName") || "To'liq ism"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1857FE]/20 focus:border-[#1857FE] transition-colors ${
                    errors.full_name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                  placeholder={t("common.enterFullName") || "To'liq ismingizni kiriting"}
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("common.phone") || "Telefon raqami"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1857FE]/20 focus:border-[#1857FE] transition-colors ${
                    errors.phone
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                  placeholder="+998901234567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phone || t("common.phoneFormat") || "Format: +998901234567"}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("common.message") || "Xabar"} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={5}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1857FE]/20 focus:border-[#1857FE] transition-colors resize-none ${
                    errors.message
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                  placeholder={t("common.enterMessage") || "Xabaringizni kiriting (kamida 10 ta belgi)"}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  {t("common.cancel") || "Bekor qilish"}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#1857FE] to-[#0d47e8] text-white rounded-lg hover:from-[#0d47e8] hover:to-[#1857FE] transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? t("common.submitting") || "Yuborilmoqda..."
                    : t("common.submit") || "Yuborish"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InterestModal;

