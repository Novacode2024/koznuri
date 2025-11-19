import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import paymeLogo from "../assets/peyme.png";
import clickLogo from "../assets/click.jpg";
import { paymentService } from "../services/paymentService";
import { useApp } from "../context/AppContext";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymeClick?: () => void;
  onClickClick?: () => void;
  appointment?: string; // Appointment UUID
  amount?: string; // Payment amount
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymeClick,
  onClickClick,
  appointment,
  amount,
}) => {
  const { t } = useTranslation();
  const { addNotification } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get appointment and amount from props or localStorage
  const currentAppointment = appointment || (typeof window !== 'undefined' ? localStorage.getItem("currentAppointmentUuid") : null);
  const currentAmount = amount || (typeof window !== 'undefined' ? localStorage.getItem("currentAppointmentPrice") : null);

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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label={t("common.close")}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-white rounded-lg sm:rounded-xl shadow-2xl overflow-hidden mx-auto my-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-5 md:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 pr-2">
            {t("contact.selectPaymentMethod") || "To'lov usulini tanlang"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl font-bold leading-none transition-colors duration-200 flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
            aria-label={t("common.close")}
          >
            ×
          </button>
        </div>

        {/* Payment Methods */}
        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          {/* Payme */}
          <button
            onClick={async () => {
              // If appointment and amount are provided (from props or localStorage), call API directly
              if (currentAppointment && currentAmount) {
                try {
                  setIsProcessing(true);
                  
                  // Create Payme payment
                  const paymentResponse = await paymentService.createPaymePayment(
                    currentAppointment,
                    currentAmount
                  );

                  // Open payment link in new tab
                  if (paymentResponse.payment_link) {
                    window.open(paymentResponse.payment_link, '_blank', 'noopener,noreferrer');
                    addNotification({
                      type: "success",
                      title: t("common.success"),
                      message: t("contact.paymentLinkOpened") || "To'lov havolasi ochildi",
                    });
                  }
                  
                  onClose();
                } catch (error) {
                  const apiError = error as { status?: number; message?: string };
                  addNotification({
                    type: "error",
                    title: t("common.error"),
                    message: apiError.message || t("contact.error") || "Xatolik yuz berdi",
                  });
                } finally {
                  setIsProcessing(false);
                }
              } else {
                // Fallback to callback if props not provided
                onPaymeClick?.();
                onClose();
              }
            }}
            disabled={isProcessing}
            className="w-full p-2 sm:p-3 md:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-blue-500 transition-all duration-200 flex items-center justify-center gap-2 sm:gap-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <img
              src={paymeLogo}
              alt="Payme"
              className="h-20 sm:h-24 md:h-28 lg:h-32 w-full object-contain"
            />
          </button>

          {/* Click */}
          <button
            onClick={async () => {
              // If appointment and amount are provided (from props or localStorage), call API directly
              if (currentAppointment && currentAmount) {
                try {
                  setIsProcessing(true);
                  
                  // Create Click payment
                  const paymentResponse = await paymentService.createClickPayment(
                    currentAppointment,
                    currentAmount
                  );

                  // Open payment link in new tab
                  if (paymentResponse.click_link?.payment_url) {
                    window.open(paymentResponse.click_link.payment_url, '_blank', 'noopener,noreferrer');
                    addNotification({
                      type: "success",
                      title: t("common.success"),
                      message: t("contact.paymentLinkOpened") || "To'lov havolasi ochildi",
                    });
                  } else {
                    addNotification({
                      type: "error",
                      title: t("common.error"),
                      message: t("dashboard.payments.noPaymentUrl") || "To'lov havolasi mavjud emas",
                    });
                  }
                  
                  onClose();
                } catch (error) {
                  const apiError = error as { status?: number; message?: string };
                  addNotification({
                    type: "error",
                    title: t("common.error"),
                    message: apiError.message || t("contact.error") || "Xatolik yuz berdi",
                  });
                } finally {
                  setIsProcessing(false);
                }
              } else {
                // Fallback to callback if props not provided
                onClickClick?.();
                onClose();
              }
            }}
            disabled={isProcessing}
            className="w-full p-2 sm:p-3 md:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-blue-500 transition-all duration-200 flex items-center justify-center gap-2 sm:gap-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <img
              src={clickLogo}
              alt="Click"
              className="h-20 sm:h-24 md:h-28 lg:h-32 w-full object-contain"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

