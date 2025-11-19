import { useState, useCallback } from "react";

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormErrors {
  [key: string]: string | null;
}

export interface UseFormValidationReturn {
  errors: FormErrors;
  validateField: (name: string, value: string) => string | null;
  validateForm: (data: Record<string, string>) => boolean;
  clearErrors: () => void;
  setError: (field: string, error: string) => void;
}

export function useFormValidation(
  rules: ValidationRules
): UseFormValidationReturn {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = useCallback(
    (name: string, value: string): string | null => {
      const rule = rules[name];
      if (!rule) return null;

      // Required validation
      if (rule.required && (!value || value.trim() === "")) {
        return `${name} maydonini to'ldirish shart`;
      }

      // Skip other validations if value is empty and not required
      if (!value || value.trim() === "") return null;

      // Min length validation
      if (rule.minLength && value.length < rule.minLength) {
        return `${name} kamida ${rule.minLength} ta belgi bo'lishi kerak`;
      }

      // Max length validation
      if (rule.maxLength && value.length > rule.maxLength) {
        return `${name} ko'pi bilan ${rule.maxLength} ta belgi bo'lishi kerak`;
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        return `${name} noto'g'ri formatda`;
      }

      // Custom validation
      if (rule.custom) {
        return rule.custom(value);
      }

      return null;
    },
    [rules]
  );

  const validateForm = useCallback(
    (data: Record<string, string>): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;

      Object.keys(rules).forEach((field) => {
        const error = validateField(field, data[field] || "");
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      });

      setErrors(newErrors);
      return isValid;
    },
    [rules, validateField]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    setError,
  };
}

// Common validation rules
export const commonValidationRules = {
  phone: {
    required: true,
    pattern: /^\+998[0-9]{9}$/,
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  age: {
    required: true,
    pattern: /^[0-9]+$/,
    custom: (value: string) => {
      const age = parseInt(value);
      if (age < 1 || age > 120) {
        return "Yosh 1 dan 120 gacha bo'lishi kerak";
      }
      return null;
    },
  },
  appointmentDate: {
    required: true,
    custom: (value: string) => {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        return "Sana bugungi kundan keyingi bo'lishi kerak";
      }
      return null;
    },
  },
  appointmentTime: {
    required: true,
    custom: (value: string) => {
      const [hours, minutes] = value.split(":").map(Number);
      const appointmentTime = hours * 60 + minutes;
      const workStart = 9 * 60; // 9:00 AM
      const workEnd = 18 * 60; // 6:00 PM

      if (appointmentTime < workStart || appointmentTime > workEnd) {
        return "Ish vaqti: 09:00 - 18:00";
      }
      return null;
    },
  },
};
