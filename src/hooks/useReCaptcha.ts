import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useCallback } from 'react';

export const useReCaptcha = () => {
  // Always call useGoogleReCaptcha unconditionally to maintain hook order
  const { executeRecaptcha } = useGoogleReCaptcha();

  const getCaptchaToken = useCallback(async (): Promise<string | null> => {
    if (!executeRecaptcha) {
      console.warn('reCAPTCHA not loaded yet');
      return null;
    }

    try {
      const token = await executeRecaptcha('submit');
      return token;
    } catch (error) {
      console.error('reCAPTCHA error:', error);
      return null;
    }
  }, [executeRecaptcha]);

  return { getCaptchaToken };
};

