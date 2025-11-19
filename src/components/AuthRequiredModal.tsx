import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister?: () => void;
  onLogin?: () => void;
}

const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  onLogin,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const handleLogin = () => {
    onClose();
    if (onLogin) {
      onLogin();
    }
    navigate("/login");
  };

  const handleRegister = () => {
    onClose();
    if (onRegister) {
      onRegister();
    }
    navigate("/register");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label={t("common.close")}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {t("contact.authRequired") || "Autentifikatsiya talab qilinadi"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none transition-colors"
            aria-label={t("common.close")}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-6 text-center">
            {t("contact.authRequiredMessage") || 
              "Qabulga yozilish uchun iltimos, avval ro'yxatdan o'ting yoki tizimga kiring."}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRegister}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              {t("common.register") || "Ro'yxatdan o'tish"}
            </button>
            <button
              onClick={handleLogin}
              className="w-full px-4 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
            >
              {t("common.login") || "Tizimga kirish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredModal;

