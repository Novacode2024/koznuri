import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import type { LocalizedDoctor } from "../services/doctorsService";
import { doctorAppointmentService } from "../services/doctorAppointmentService";

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
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: "",
    patientPhone: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!doctor || !doctor.uuid) {
      addNotification({
        type: "error",
        title: t("common.error"),
        message: t("appointment.error") || "Doctor ma'lumotlari topilmadi",
      });
      return;
    }

    // Split patientName into first_name and last_name
    const nameParts = formData.patientName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Clean phone number
    const cleanPhone = formData.patientPhone.trim().replace(/\s+/g, "");

    // Prepare appointment data
    const appointmentData = {
      first_name: firstName,
      last_name: lastName,
      phone: cleanPhone,
      date: formData.appointmentDate || "",
      language: getApiLanguage(),
      time: formData.appointmentTime || "",
      doctor_uuid: doctor.uuid,
    };

    try {
      setSubmitting(true);

      await doctorAppointmentService.createDoctorAppointment(appointmentData);

      addNotification({
        type: "success",
        title: t("common.success"),
        message: t("appointment.success") || "Qabul muvaffaqiyatli qo'shildi",
        duration: 4000, // 4 seconds
      });

      // Reset form
      setFormData({
        patientName: "",
        patientPhone: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
      });

      // Call original onSubmit callback if provided
      onSubmit(formData);
      onClose();
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1857FE] focus:border-transparent"
              />
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
    </div>
  );
};

export default AppointmentModal;

