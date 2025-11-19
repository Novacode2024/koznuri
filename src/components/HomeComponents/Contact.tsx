import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import contactsImage from "../../assets/contacts.svg";
import {
  useFormValidation,
  commonValidationRules,
} from "../../hooks/useFormValidation";
import { useApp } from "../../context/AppContext";
import { useCompanyPhones } from "../../hooks/useCompanyPhones";
import { doctorsService, type Doctor } from "../../services/doctorsService";
import { appointmentService } from "../../services/appointmentService";
import { paymentService } from "../../services/paymentService";
import PaymentModal from "../PaymentModal";
import AuthRequiredModal from "../AuthRequiredModal";

interface AppointmentFormData {
  firstName: string;
  lastName: string;
  branch: string;
  phone: string;
  doctor: string;
  age: string;
  appointmentDate: string;
  appointmentTime: string;
}

interface AppointmentFormProps {
  hideTitle?: boolean;
  onClose?: () => void;
}

export const  AppointmentForm = ({ hideTitle = false, onClose }: AppointmentFormProps) => {
  const { t, i18n } = useTranslation();
  const { data: branches, loading: branchesLoading } = useCompanyPhones();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [price, setPrice] = useState<string>("");
  const [priceLoading, setPriceLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAuthRequiredModalOpen, setIsAuthRequiredModalOpen] = useState(false);
  const [appointmentUuid, setAppointmentUuid] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  
  const [formData, setFormData] = useState<AppointmentFormData>({
    firstName: "",
    lastName: "",
    branch: "",
    phone: "",
    doctor: "",
    age: "",
    appointmentDate: "",
    appointmentTime: "",
  });

  const { addNotification } = useApp();
  const { errors, validateField, validateForm: baseValidateForm, clearErrors, setError } =
    useFormValidation({
      firstName: commonValidationRules.name,
      lastName: commonValidationRules.name,
      branch: { required: true },
      phone: commonValidationRules.phone,
      doctor: { required: false }, // Will be validated conditionally
      age: { required: false, custom: (value: string) => {
        if (!value || value.trim() === "") return null;
        const age = parseInt(value);
        if (isNaN(age) || age < 1 || age > 100) {
          return "Yosh 1 dan 100 gacha bo'lishi kerak";
        }
        return null;
      }}, // Will be validated conditionally
      appointmentDate: commonValidationRules.appointmentDate,
      appointmentTime: commonValidationRules.appointmentTime,
    });

  // Custom validation function that enforces XOR between doctor and age
  const validateForm = useCallback((data: Record<string, string>): boolean => {
    // Check XOR condition: either doctor OR age must be selected, but not both
    const hasDoctor = data.doctor && data.doctor.trim() !== "";
    const hasAge = data.age && data.age.trim() !== "";
    
    if (!hasDoctor && !hasAge) {
      setError("doctor", "Doctor yoki yosh tanlanishi shart");
      setError("age", "Doctor yoki yosh tanlanishi shart");
      return false;
    }
    
    if (hasDoctor && hasAge) {
      setError("doctor", "Faqat doctor yoki yosh tanlanishi kerak");
      setError("age", "Faqat doctor yoki yosh tanlanishi kerak");
      return false;
    }
    
    // Validate age if it's selected
    if (hasAge) {
      const ageValue = data.age.trim();
      if (!ageValue) {
        setError("age", "Yosh kiritilishi shart");
        return false;
      }
      const age = parseInt(ageValue);
      if (isNaN(age) || age < 1 || age > 100) {
        setError("age", "Yosh 1 dan 100 gacha bo'lishi kerak");
        return false;
      }
    }
    
    // Validate doctor if it's selected
    if (hasDoctor) {
      if (!data.doctor || data.doctor.trim() === "") {
        setError("doctor", "Doctor tanlanishi shart");
        return false;
      }
    }
    
    // Validate all other fields
    return baseValidateForm(data);
  }, [baseValidateForm, setError]);

  // Get current language code
  const currentLangCode = useMemo(() => {
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
  }, [i18n.language]);

  // Get language for API (same mapping)
  const apiLanguage = useMemo(() => {
    return currentLangCode;
  }, [currentLangCode]);

  // Get localized branch title
  const getBranchTitle = useCallback((branch: NonNullable<typeof branches>[0]): string => {
    if (!branch) return "";
    const titleKey = `title_${currentLangCode}` as keyof typeof branch;
    return (branch[titleKey] as string) || branch.title_uz;
  }, [currentLangCode]);

  // Save selected branch UUID to localStorage
  useEffect(() => {
    const STORAGE_KEY = "selectedBranchUuid";
    
    if (formData.branch && formData.branch.trim()) {
      try {
        localStorage.setItem(STORAGE_KEY, formData.branch.trim());
      } catch {
        // Silent fail for localStorage
      }
    } else {
      // Clear localStorage if no branch is selected
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Silent fail for localStorage
      }
    }
  }, [formData.branch]);

  // Save selected doctor UUID to localStorage
  useEffect(() => {
    const STORAGE_KEY = "selectedDoctorUuid";
    
    if (formData.doctor && formData.doctor.trim()) {
      try {
        localStorage.setItem(STORAGE_KEY, formData.doctor.trim());
      } catch {
        // Silent fail for localStorage
      }
    } else {
      // Clear localStorage if no doctor is selected
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Silent fail for localStorage
      }
    }
  }, [formData.doctor]);

  // Fetch doctors by branch UUID from localStorage and update state
  useEffect(() => {
    const STORAGE_KEY = "selectedBranchUuid";
    
    const fetchDoctorsByStoredBranch = async () => {
      try {
        const storedBranchUuid = localStorage.getItem(STORAGE_KEY);
        
        if (!storedBranchUuid || !storedBranchUuid.trim()) {
          return;
        }

        const branchUuid = storedBranchUuid.trim();

        setDoctorsLoading(true);
        const doctorsData = await doctorsService.getDoctorsByBranch(branchUuid);
        
        // Handle response data
        let doctorsArray: Doctor[] = [];
        
        if (Array.isArray(doctorsData)) {
          doctorsArray = doctorsData;
        } else if (doctorsData && typeof doctorsData === 'object') {
          const wrappedData = (doctorsData as { data?: Doctor[]; results?: Doctor[] }).data || 
                             (doctorsData as { data?: Doctor[]; results?: Doctor[] }).results;
          if (Array.isArray(wrappedData)) {
            doctorsArray = wrappedData;
          }
        }
        
        // Update doctors state
        setDoctors(doctorsArray);
      } catch {
        setDoctors([]);
      } finally {
        setDoctorsLoading(false);
      }
    };

    // Fetch doctors when branch UUID is saved to localStorage
    if (formData.branch && formData.branch.trim()) {
      fetchDoctorsByStoredBranch();
    }
  }, [formData.branch]);

  // Fetch doctors when branch is selected
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!formData.branch || !formData.branch.trim()) {
        setDoctors([]);
        setFormData(prev => ({ ...prev, doctor: "" }));
        setPrice("");
        return;
      }

      const branchUuid = formData.branch.trim();
      
      // Verify branch exists in branches list
      const selectedBranch = branches?.find((branch) => branch.uuid === branchUuid);
      if (!selectedBranch) {
        setDoctors([]);
        return;
      }

      // Validate UUID format
      if (branchUuid.length < 10) {
        setDoctors([]);
        return;
      }

      try {
        setDoctorsLoading(true);
        setDoctors([]);
        
        const doctorsData = await doctorsService.getDoctorsByBranch(branchUuid);
        
        // Handle response data
        let doctorsArray: Doctor[] = [];
        
        if (Array.isArray(doctorsData)) {
          doctorsArray = doctorsData;
        } else if (doctorsData && typeof doctorsData === 'object') {
          const wrappedData = (doctorsData as { data?: Doctor[]; results?: Doctor[] }).data || 
                             (doctorsData as { data?: Doctor[]; results?: Doctor[] }).results;
          if (Array.isArray(wrappedData)) {
            doctorsArray = wrappedData;
          }
        }
        
        setDoctors(doctorsArray);
        setFormData(prev => ({ ...prev, doctor: "" }));
        setPrice("");
      } catch (error: unknown) {
        const apiError = error as { status?: number; message?: string; details?: { detail?: string } };
        
        // Don't show notification for 404 errors - branch might not have doctors
        if (apiError?.status !== 404) {
          addNotification({
            type: "error",
            title: t("common.error"),
            message: apiError?.message || t("contact.errorFetchingDoctors"),
          });
        }
        setDoctors([]);
      } finally {
        setDoctorsLoading(false);
      }
    };

    fetchDoctors();
  }, [formData.branch, branches, addNotification, t, getBranchTitle]);

  // Fetch price when doctor is selected (from formData or localStorage)
  useEffect(() => {
    const fetchDoctorPrice = async () => {
      // If age is selected, don't fetch doctor price
      if (formData.age && formData.age.trim() !== "") {
        return;
      }

      const STORAGE_KEY = "selectedDoctorUuid";
      
      // Get doctor UUID from formData or localStorage
      const doctorUuid = formData.doctor?.trim() || localStorage.getItem(STORAGE_KEY)?.trim();
      
      if (!doctorUuid) {
        setPrice("");
        return;
      }

      try {
        setPriceLoading(true);
        
        const priceData = await doctorsService.getDoctorPrice(doctorUuid);
        
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

    // Fetch doctor price if doctor is selected and age is not selected
    fetchDoctorPrice();
  }, [formData.doctor, formData.age]);

  // Fetch price when age is selected
  useEffect(() => {
    const fetchAgePrice = async () => {
      // If doctor is selected, don't fetch age price
      if (formData.doctor && formData.doctor.trim() !== "") {
        return;
      }

      if (!formData.age || formData.age.trim() === "") {
        setPrice("");
        return;
      }

      const age = parseInt(formData.age.trim());
      if (isNaN(age) || age < 1 || age > 100) {
        setPrice("");
        return;
      }

      try {
        setPriceLoading(true);
        
        const priceData = await doctorsService.getPriceByAge(age);
        
        // Handle response - API returns {price: 50000.0}
        const priceValue = priceData.price;
        
        // Format price as number with locale formatting
        const formattedPrice = typeof priceValue === 'number' 
          ? priceValue.toLocaleString('uz-UZ', { maximumFractionDigits: 0 })
          : String(priceValue);
        
        setPrice(formattedPrice);
      } catch {
        setPrice("");
      } finally {
        setPriceLoading(false);
      }
    };

    // Fetch age price if age is selected and doctor is not selected
    fetchAgePrice();
  }, [formData.age, formData.doctor]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // If branch changes, reset doctor
    if (name === "branch") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        doctor: "",
        age: "", // Also clear age when branch changes
      }));
    } else if (name === "doctor") {
      // If doctor is selected, clear age and reset price
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        age: "", // Clear age when doctor is selected
      }));
      setPrice(""); // Reset price when doctor changes
    } else if (name === "age") {
      // If age is entered, clear doctor and reset price
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        doctor: "", // Clear doctor when age is entered
      }));
      setPrice(""); // Reset price when doctor is cleared
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      clearErrors();
    }
  };

  // Check authentication when user interacts with form fields
  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      // Open auth required modal
      setIsAuthRequiredModalOpen(true);
      // Blur the field to prevent typing
      e.target.blur();
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      // Error will be shown in the UI
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData as unknown as Record<string, string>)) {
      addNotification({
        type: "error",
        title: t("common.error"),
        message: t("contact.error"),
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

    // If token exists, create appointment first, then open payment modal
    await handlePaymentSubmit();
  };

  const handlePaymentSubmit = async () => {
    // Prepare appointment data (outside try block for error logging)
    // Clean phone number - remove spaces and keep only digits and +
    const cleanPhone = formData.phone.trim().replace(/\s+/g, "");
    
    // Extract date from datetime-local format (YYYY-MM-DDTHH:mm -> YYYY-MM-DD)
    // If appointmentDate contains 'T', extract only the date part
    let appointmentDate = formData.appointmentDate.trim();
    if (appointmentDate.includes('T')) {
      appointmentDate = appointmentDate.split('T')[0];
    }
    
    // Prepare age - only if doctor is not selected (XOR logic)
    const ageValue = formData.doctor?.trim() 
      ? undefined 
      : (formData.age?.trim() || undefined);
    
    // Prepare doctor_uuid - only if age is not selected (XOR logic)
    const doctorUuid = formData.age?.trim() 
      ? undefined 
      : (formData.doctor?.trim() || undefined);
    
    // Prepare price - remove spaces and formatting for API
    // Yosh tanlaganda ham narx keladi, shu narxni yuborish kerak
    const priceValue = price 
      ? price.replace(/\s+/g, "").replace(/,/g, "") 
      : undefined;
    
    const appointmentData = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      branch_uuid: formData.branch.trim(),
      doctor_uuid: doctorUuid,
      phone: cleanPhone,
      date: appointmentDate,
      language: apiLanguage,
      age: ageValue,
      price: priceValue,
    };

    try {
      setSubmitting(true);

      // Send appointment data
      const response = await appointmentService.createAppointment(appointmentData);

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

      addNotification({
        type: "success",
        title: t("common.success"),
        message: t("contact.success"),
      });
    } catch (error) {
      const apiError = error as { status?: number; message?: string };

      addNotification({
        type: "error",
        title: t("common.error"),
        message: apiError.message || t("contact.error"),
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

      // Create Payme payment
      const paymentResponse = await paymentService.createPaymePayment(currentAppointmentUuid, currentAmount);

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
        firstName: "",
        lastName: "",
        branch: "",
        phone: "",
        doctor: "",
        age: "",
        appointmentDate: "",
        appointmentTime: "",
      });
      setPrice("");
      setAppointmentUuid("");
      setPaymentAmount("");
      clearErrors();
      
      // Clear localStorage (UUID and Price)
      try {
        localStorage.removeItem("currentAppointmentUuid");
        localStorage.removeItem("currentAppointmentPrice");
      } catch {
        // Silent fail
      }
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

      // Create Click payment
      const paymentResponse = await paymentService.createClickPayment(currentAppointmentUuid, currentAmount);

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
        firstName: "",
        lastName: "",
        branch: "",
        phone: "",
        doctor: "",
        age: "",
        appointmentDate: "",
        appointmentTime: "",
      });
      setPrice("");
      setAppointmentUuid("");
      setPaymentAmount("");
      clearErrors();
      
      // Clear localStorage (UUID and Price)
      try {
        localStorage.removeItem("currentAppointmentUuid");
        localStorage.removeItem("currentAppointmentPrice");
      } catch {
        // Silent fail
      }
    } catch (error) {
      const apiError = error as { status?: number; message?: string };
      
      addNotification({
        type: "error",
        title: t("common.error"),
        message: apiError.message || t("contact.error"),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!hideTitle && (
        <div>
          <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-bold text-[#282828] mb-2 sm:mb-3 md:mb-4">
            {t("contact.title")}
          </h2>
          <p className="text-[#282828] text-sm sm:text-base md:text-lg mb-4 sm:mb-5 md:mb-6">
            {t("contact.subtitle")}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-[#282828] mb-2"
          >
            {t("contact.firstName")}
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={t("contact.firstNamePlaceholder")}
            required
            className={`w-full px-4 py-3 bg-white rounded-xl border focus:ring-1 focus:outline-none transition-colors placeholder:text-gray-400 placeholder:text-sm ${
              errors.firstName
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-[#1857FE] focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-[#282828] mb-2"
          >
            {t("contact.lastName")}
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={t("contact.lastNamePlaceholder")}
            required
            className={`w-full px-4 py-3 bg-white rounded-xl border focus:ring-1 focus:outline-none transition-colors placeholder:text-gray-400 placeholder:text-sm ${
              errors.lastName
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-[#1857FE] focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>

        {/* Select Branch */}
        <div>
          <label
            htmlFor="branch"
            className="block text-sm font-medium text-[#282828] mb-2"
          >
            {t("contact.branch")}
          </label>
          <select
            id="branch"
            name="branch"
            value={formData.branch}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required
            disabled={branchesLoading || !branches || branches.length === 0}
            className={`w-full px-4 py-3 bg-white rounded-xl border focus:ring-1 focus:outline-none transition-colors ${
              errors.branch
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-[#1857FE] focus:border-blue-500 focus:ring-blue-500"
            } ${branchesLoading || !branches || branches.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <option value="">
              {branchesLoading 
                ? t("common.loading") 
                : !branches || branches.length === 0
                ? t("contact.noBranchesAvailable")
                : t("contact.branchPlaceholder")}
            </option>
            {branches?.filter(branch => branch.is_active !== false).map((branch) => {
              if (!branch.uuid) {
                return null;
              }
              return (
                <option key={branch.uuid} value={branch.uuid}>
                  {getBranchTitle(branch)}
                </option>
              );
            })}
          </select>
          {errors.branch && (
            <p className="mt-1 text-sm text-red-600">{errors.branch}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-[#282828] mb-2"
          >
            {t("contact.phone")}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={t("contact.phonePlaceholder")}
            required
            className={`w-full px-4 py-3 bg-white rounded-xl border focus:ring-1 focus:outline-none transition-colors placeholder:text-gray-400 placeholder:text-sm ${
              errors.phone
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-[#1857FE] focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Select Doctor */}
        <div>
          <label
            htmlFor="doctor"
            className="block text-sm font-medium text-[#282828] mb-2"
          >
            {t("contact.doctor")}
          </label>
          <select
            id="doctor"
            name="doctor"
            value={formData.doctor}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required={!formData.age || formData.age.trim() === ""}
            disabled={!formData.branch || doctorsLoading || !!(formData.age && formData.age.trim() !== "")}
            className={`w-full px-4 py-3 bg-white rounded-xl border focus:ring-1 focus:outline-none transition-colors ${
              errors.doctor
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-[#1857FE] focus:border-blue-500 focus:ring-blue-500"
            } ${!formData.branch || doctorsLoading || (formData.age && formData.age.trim() !== "") ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <option value="">
              {!formData.branch
                ? t("contact.selectBranchFirst")
                : doctorsLoading
                ? t("common.loading")
                : t("contact.doctorPlaceholder")}
            </option>
            {doctors && Array.isArray(doctors) && doctors.length > 0
              ? doctors.map((doctor) => (
                  <option key={doctor.uuid} value={doctor.uuid}>
                    {doctor.full_name || t("contact.unknownDoctor")}
                  </option>
                ))
              : !doctorsLoading && formData.branch && (
                  <option value="" disabled>
                    {t("contact.noDoctorsAvailable")}
                  </option>
                )}
          </select>
          {errors.doctor && (
            <p className="mt-1 text-sm text-red-600">{errors.doctor}</p>
          )}
          {!formData.branch && (
            <p className="mt-1 text-sm text-amber-600">
              {t("contact.selectBranchFirst")}
            </p>
          )}
          {formData.age && formData.age.trim() !== "" && (
            <p className="mt-1 text-sm text-amber-600">
              {t("contact.doctorDisabledWhenAgeSelected")}
            </p>
          )}
        </div>

        {/* Age */}
        <div>
          <label
            htmlFor="age"
            className="block text-sm font-medium text-[#282828] mb-2"
          >
            {t("contact.age")}
          </label>
          <select
            id="age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required={!formData.doctor || formData.doctor.trim() === ""}
            disabled={!!(formData.doctor && formData.doctor.trim() !== "")}
            className={`w-full px-4 py-3 bg-white rounded-xl border focus:ring-1 focus:outline-none transition-colors ${
              errors.age
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-[#1857FE] focus:border-blue-500 focus:ring-blue-500"
            } ${formData.doctor && formData.doctor.trim() !== "" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <option value="">
              {formData.doctor && formData.doctor.trim() !== ""
                ? t("contact.ageDisabledWhenDoctorSelected")
                : t("contact.agePlaceholder")}
            </option>
            {Array.from({ length: 100 }, (_, i) => i + 1).map((age) => (
              <option key={age} value={age.toString()}>
                {age}
              </option>
            ))}
          </select>
          {errors.age && (
            <p className="mt-1 text-sm text-red-600">{errors.age}</p>
          )}
          {formData.doctor && formData.doctor.trim() !== "" && (
            <p className="mt-1 text-sm text-amber-600">
              {t("contact.ageDisabledWhenDoctorSelected")}
            </p>
          )}
        </div>

        {/* Appointment Date & Time */}
        <div>
          <label
            htmlFor="appointmentDateTime"
            className="block text-sm font-medium text-[#282828] mb-2"
          >
            {t("contact.appointmentTime")}
          </label>
          <input
            type="datetime-local"
            id="appointmentDateTime"
            name="appointmentDateTime"
            value={formData.appointmentDate && formData.appointmentTime 
              ? `${formData.appointmentDate}T${formData.appointmentTime}` 
              : ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                const [date, time] = value.split('T');
                setFormData((prev) => ({
                  ...prev,
                  appointmentDate: date || "",
                  appointmentTime: time || "",
                }));
              } else {
                setFormData((prev) => ({
                  ...prev,
                  appointmentDate: "",
                  appointmentTime: "",
                }));
              }
              if (errors.appointmentDate || errors.appointmentTime) {
                clearErrors();
              }
            }}
            onFocus={handleFocus}
            onBlur={(e) => {
              const value = e.target.value;
              if (value) {
                const [date, time] = value.split('T');
                if (date) {
                  const dateError = validateField("appointmentDate", date);
                  if (dateError) {
                    // Error will be shown in the UI
                  }
                }
                if (time) {
                  const timeError = validateField("appointmentTime", time);
                  if (timeError) {
                    // Error will be shown in the UI
                  }
                }
              }
            }}
            required
            className={`w-full px-4 py-3 bg-white rounded-xl border focus:ring-1 focus:outline-none transition-colors placeholder:text-gray-400 placeholder:text-sm ${
              errors.appointmentTime || errors.appointmentDate
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-[#1857FE] focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          {(errors.appointmentTime || errors.appointmentDate) && (
            <p className="mt-1 text-sm text-red-600">
              {errors.appointmentTime || errors.appointmentDate}
            </p>
          )}
        </div>
        <div>
          <label className="text-[#282828] text-sm font-medium mb-2 block">{t("contact.visitAmount")}</label>
     <div className="w-full px-3 py-3 rounded-[10px] text-center border border-[#1857FE] outline-offset-[-1px] outline-blue-600 inline-flex justify-between items-center">
            <div className="text-center justify-start text-black text-base sm:text-lg md:text-[20px]">
              {priceLoading
                ? t("common.loading")
                : price
                ? `${price} ${t("common.currency")}`
                : formData.doctor || (formData.age && formData.age.trim() !== "")
                ? t("contact.noPriceAvailable")
                : t("contact.selectDoctorOrAgeForPrice")}
            </div>
          </div>     
        </div>
      </div>
      <div className="w-full">
        <button
          type="submit"
          disabled={submitting}
          className="Button w-full h-12 sm:h-14 md:h-16 px-4 sm:px-5 md:px-6 py-3 bg-blue-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="text-center justify-start text-white text-sm sm:text-base md:text-[20px]">
            {submitting ? t("common.loading") : t("contact.payButton")}
          </div>
        </button>
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
    </form>
  );
};

const Contact = () => {
  return (
    <section className="bg-[#fff] py-10 sm:py-12">
      <div className="max-w-[1380px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column - Form */}
          <div>
            <AppointmentForm />
          </div>

          {/* Right Column - Image */}
          <div className="flex items-center justify-center order-first lg:order-none mb-6 lg:mb-0">
            <img
              src={contactsImage}
              alt="Contact illustration"
              className="w-full max-w-full lg:max-w-none h-96 sm:h-[500px] lg:h-full object-cover lg:object-contain rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
