import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import type { LocalizedDoctor } from "../services/doctorsService";
import { doctorsService } from "../services/doctorsService";
import { appointmentService } from "../services/appointmentService";
import { paymentService } from "../services/paymentService";
import PaymentModal from "./PaymentModal";
import AuthRequiredModal from "./AuthRequiredModal";
import { useReCaptcha } from "../hooks/useReCaptcha";

interface AppointmentModalProps {
  doctor: LocalizedDoctor | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => void;
}

export interface AppointmentFormData {
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  doctor,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t, i18n } = useTranslation();
  const { addNotification } = useApp();
  const { getCaptchaToken } = useReCaptcha();
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: "",
    patientPhone: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAuthRequiredModalOpen, setIsAuthRequiredModalOpen] = useState(false);
  const [appointmentUuid, setAppointmentUuid] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [priceLoading, setPriceLoading] = useState(false);

  // Get current language code for API
  const getApiLanguage = (): string => {
    const lang = i18n.language;
    const langMap: Record<string, string> = {
      "uz-latin": "uz",
      "uz-cyrillic": "kr",
      uz: "uz",
      ru: "ru",
      en: "en",
      tg: "tj",
      kz: "kz",
      ky: "kg",
    };
    return langMap[lang] || "uz";
  };

  // Fetch doctor price when doctor is available
  useEffect(() => {
    const fetchDoctorPrice = async () => {
      if (!doctor || !doctor.uuid) {
        setPrice("");
        return;
      }

      try {
        setPriceLoading(true);
        const priceData = await doctorsService.getDoctorPrice(doctor.uuid);
        
        // Handle response - API returns {service_price: "80 000"} or {price: "80 000"}
        const priceValue = priceData.service_price || priceData.price || "";
        
        // Format price if it's a number
        const formattedPrice = typeof priceValue === 'number' 
          ? priceValue.toLocaleString('uz-UZ')
          : priceValue;
        
        setPrice(formattedPrice);
      } catch {
        setPrice("");
      } finally {
        setPriceLoading(false);
      }
    };

    fetchDoctorPrice();
  }, [doctor]);

  // Check authentication when user interacts with form fields
  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      // Open auth required modal
      setIsAuthRequiredModalOpen(true);
      // Blur the field to prevent typing
      e.target.blur();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!doctor || !doctor.uuid || !doctor.branch || !doctor.branch.uuid) {
      addNotification({
        type: "error",
        title: t("common.error"),
        message: t("appointment.error") || "Doctor ma'lumotlari topilmadi",
      });
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem("auth_token");
    if (!token) {
      // Open auth required modal instead of redirecting
      setIsAuthRequiredModalOpen(true);
      return;
    }

    // Split patientName into first_name and last_name
    const nameParts = formData.patientName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Clean phone number
    const cleanPhone = formData.patientPhone.trim().replace(/\s+/g, "");

    // Extract date from datetime-local format (YYYY-MM-DDTHH:mm -> YYYY-MM-DD)
    let appointmentDate = formData.appointmentDate.trim();
    if (appointmentDate.includes('T')) {
      appointmentDate = appointmentDate.split('T')[0];
    }

    // Prepare price - remove spaces and formatting for API
    const priceValue = price 
      ? price.replace(/\s+/g, "").replace(/,/g, "") 
      : undefined;

    // Prepare appointment data for api/client/appointment/create/
    const appointmentData = {
      first_name: firstName,
      last_name: lastName,
      branch_uuid: doctor.branch.uuid,
      doctor_uuid: doctor.uuid,
      phone: cleanPhone,
      date: appointmentDate,
      language: getApiLanguage(),
      price: priceValue,
    };

    try {
      setSubmitting(true);

      // Get reCAPTCHA token
      const captchaToken = await getCaptchaToken();

      // Send appointment data to api/client/appointment/create/
      const response = await appointmentService.createAppointment(appointmentData, captchaToken);

      // Extract appointment UUID from response
      const appointmentId = response.appointment || response.uuid || (response.data as { uuid?: string; appointment?: string })?.uuid || (response.data as { uuid?: string; appointment?: string })?.appointment;
      
      if (appointmentId) {
        // Save appointment UUID to localStorage
        try {
          localStorage.setItem("currentAppointmentUuid", appointmentId);
        } catch {
          // Silent fail
        }
        setAppointmentUuid(appointmentId);
      }

      // Save payment amount to state and localStorage
      if (priceValue) {
        setPaymentAmount(priceValue);
        
        // Save price to localStorage
        try {
          localStorage.setItem("currentAppointmentPrice", priceValue);
        } catch {
          // Silent fail
        }
      } else {
        // Clear price from localStorage if no price
        try {
          localStorage.removeItem("currentAppointmentPrice");
        } catch {
          // Silent fail
        }
      }

      // Open payment modal after successful appointment creation
      setIsPaymentModalOpen(true);

      // Call original onSubmit callback if provided (for backward compatibility)
      onSubmit(formData);

      addNotification({
        type: "success",
        title: t("common.success"),
        message: t("appointment.success") || "Qabul muvaffaqiyatli qo'shildi",
        duration: 4000,
      });
    } catch (error) {
      const apiError = error as { status?: number; message?: string };
      addNotification({
        type: "error",
        title: t("common.error"),
        message: apiError.message || t("appointment.error") || "Qabul qo'shishda xatolik yuz berdi",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymeClick = async () => {
    try {
      // Get appointment UUID from state or localStorage
      const currentAppointmentUuid = appointmentUuid || localStorage.getItem("currentAppointmentUuid");
      // Get price from state, localStorage, or current price
      const currentAmount = paymentAmount || localStorage.getItem("currentAppointmentPrice") || price.replace(/\s+/g, "").replace(/,/g, "");

      if (!currentAppointmentUuid || !currentAmount) {
        addNotification({
          type: "error",
          title: t("common.error"),
          message: t("contact.error") || "Ma'lumotlar to'liq emas",
        });
        return;
      }

      // Get reCAPTCHA token
      const captchaToken = await getCaptchaToken();

      // Create Payme payment
      const paymentResponse = await paymentService.createPaymePayment(currentAppointmentUuid, currentAmount, captchaToken);

      // Open payment link in new tab
      if (paymentResponse.payment_link) {
        window.open(paymentResponse.payment_link, '_blank', 'noopener,noreferrer');
        addNotification({
          type: "success",
          title: t("common.success"),
          message: t("dashboard.payments.paymentLinkOpened") || "To'lov havolasi ochildi",
        });
      } else {
        addNotification({
          type: "error",
          title: t("common.error"),
          message: t("dashboard.payments.noPaymentUrl") || "To'lov havolasi mavjud emas",
        });
      }

      // Reset form after payment link is opened
      setFormData({
        patientName: "",
        patientPhone: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
      });
      setPrice("");
      setAppointmentUuid("");
      setPaymentAmount("");
      
      // Clear localStorage (UUID and Price)
      try {
        localStorage.removeItem("currentAppointmentUuid");
        localStorage.removeItem("currentAppointmentPrice");
      } catch {
        // Silent fail
      }

      // Close modals
      setIsPaymentModalOpen(false);
      onClose();
    } catch (error) {
      const apiError = error as { status?: number; message?: string };
      
      addNotification({
        type: "error",
        title: t("common.error"),
        message: apiError.message || t("contact.error"),
      });
    }
  };

  const handleClickClick = async () => {
    try {
      // Get appointment UUID from state or localStorage
      const currentAppointmentUuid = appointmentUuid || localStorage.getItem("currentAppointmentUuid");
      // Get price from state, localStorage, or current price
      const currentAmount = paymentAmount || localStorage.getItem("currentAppointmentPrice") || price.replace(/\s+/g, "").replace(/,/g, "");

      if (!currentAppointmentUuid || !currentAmount) {
        addNotification({
          type: "error",
          title: t("common.error"),
          message: t("contact.error") || "Ma'lumotlar to'liq emas",
        });
        return;
      }

      // Get reCAPTCHA token
      const captchaToken = await getCaptchaToken();

      // Create Click payment
      const paymentResponse = await paymentService.createClickPayment(currentAppointmentUuid, currentAmount, captchaToken);

      // Open payment link in new tab
      if (paymentResponse.click_link?.payment_url) {
        window.open(paymentResponse.click_link.payment_url, '_blank', 'noopener,noreferrer');
        addNotification({
          type: "success",
          title: t("common.success"),
          message: t("dashboard.payments.paymentLinkOpened") || "To'lov havolasi ochildi",
        });
      } else {
        addNotification({
          type: "error",
          title: t("common.error"),
          message: t("dashboard.payments.noPaymentUrl") || "To'lov havolasi mavjud emas",
        });
      }

      // Reset form after payment link is opened
      setFormData({
        patientName: "",
        patientPhone: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
      });
      setPrice("");
      setAppointmentUuid("");
      setPaymentAmount("");
      
      // Clear localStorage (UUID and Price)
      try {
        localStorage.removeItem("currentAppointmentUuid");
        localStorage.removeItem("currentAppointmentPrice");
      } catch {
        // Silent fail
      }

      // Close modals
      setIsPaymentModalOpen(false);
      onClose();
    } catch (error) {
      const apiError = error as { status?: number; message?: string };
      
      addNotification({
        type: "error",
        title: t("common.error"),
        message: apiError.message || t("contact.error"),
      });
    }
  };

  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {t("appointment.bookAppointment") || "Қабулга ёзилиш"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Doctor Info */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <img
              src={doctor.image}
              alt={doctor.fullName}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-lg text-gray-800">
                {doctor.fullName}
              </h3>
              <p className="text-gray-600">{doctor.job}</p>
              <p className="text-sm text-gray-500">
                {doctor.experience} {t("doctors.yearsExperience")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("appointment.patientName") || "Тўлиқ исминиз"}
            </label>
            <input
              type="text"
              required
              value={formData.patientName}
              onChange={(e) =>
                setFormData({ ...formData, patientName: e.target.value })
              }
              onFocus={handleFocus}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1857FE] focus:border-transparent"
              placeholder={t("appointment.patientNamePlaceholder") || "Исмингизни киритинг"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("appointment.phoneNumber") || "Телефон рақами"}
            </label>
            <input
              type="tel"
              required
              value={formData.patientPhone}
              onChange={(e) =>
                setFormData({ ...formData, patientPhone: e.target.value })
              }
              onFocus={handleFocus}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1857FE] focus:border-transparent"
              placeholder="+998901234567"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("appointment.date") || "Сана"}
              </label>
              <input
                type="date"
                required
                value={formData.appointmentDate}
                onChange={(e) =>
                  setFormData({ ...formData, appointmentDate: e.target.value })
                }
                onFocus={handleFocus}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1857FE] focus:border-transparent"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("appointment.time") || "Вақт"}
              </label>
              <input
                type="time"
                required
                value={formData.appointmentTime}
                onChange={(e) =>
                  setFormData({ ...formData, appointmentTime: e.target.value })
                }
                onFocus={handleFocus}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1857FE] focus:border-transparent"
              />
            </div>
          </div>

          {/* Price Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("contact.visitAmount") || "To'lov summasi"}
            </label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-center">
              <span className="text-gray-700">
                {priceLoading
                  ? t("common.loading") || "Юкланмоқда..."
                  : price
                  ? `${price} ${t("common.currency") || "so'm"}`
                  : t("contact.noPriceAvailable") || "Narx mavjud emas"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("appointment.reason") || "Шикоят"}
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              onFocus={handleFocus}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1857FE] focus:border-transparent"
              rows={3}
              placeholder={t("appointment.reasonPlaceholder") || "Шикоятингизни ёзинг"}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {t("common.cancel") || "Бекор қилиш"}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-[#1857FE] text-white rounded-lg hover:bg-[#0d47e8] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? t("common.loading") || "Юкланмоқда..." : t("appointment.submit") || "Жўнатиш"}
            </button>
          </div>
        </form>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymeClick={handlePaymeClick}
        onClickClick={handleClickClick}
        appointment={appointmentUuid || localStorage.getItem("currentAppointmentUuid") || undefined}
        amount={paymentAmount || (price ? price.replace(/\s+/g, "").replace(/,/g, "") : undefined)}
      />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={isAuthRequiredModalOpen}
        onClose={() => setIsAuthRequiredModalOpen(false)}
        onRegister={onClose}
        onLogin={onClose}
      />
    </div>
  );
};

export default AppointmentModal;

