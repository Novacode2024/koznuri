import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

// Types for chat links
type LanguageSuffix = 'uz' | 'ru' | 'en' | 'tj' | 'kz' | 'kg';
type ChatFieldKey = `chat_telegram_${LanguageSuffix}` | `chat_whatsapp_${LanguageSuffix}`;
type ChatsResponse = Partial<Record<ChatFieldKey, string | null>>;

interface ContactCommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCallCenterClick: () => void;
}

const ContactCommandMenu: React.FC<ContactCommandMenuProps> = ({
  isOpen,
  onClose,
  onCallCenterClick,
}) => {
  const { t, i18n } = useTranslation();
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);

  // Resolve i18n language to API suffix
  const resolveSocialLanguage = useCallback((): LanguageSuffix => {
    const lang = (i18n.language || 'uz').toLowerCase();

    if (lang === 'kr' || lang.startsWith('uz')) return 'uz';
    if (lang.startsWith('ru')) return 'ru';
    if (lang.startsWith('en')) return 'en';
    if (lang.startsWith('tg') || lang.startsWith('tj')) return 'tj';
    if (lang.startsWith('kz')) return 'kz';
    if (lang.startsWith('ky') || lang.startsWith('kg')) return 'kg';

    return 'uz';
  }, [i18n.language]);

  // Fetch chat links from API
  useEffect(() => {
    let isMounted = true;

    const fetchChatLinks = async () => {
      try {
        const data = await api.get<ChatsResponse>('/contact/chats/', { skipAuth: true });
        if (isMounted) {
          const langKey = resolveSocialLanguage();
          
          // Get WhatsApp URL
          const whatsappKey = `chat_whatsapp_${langKey}` as keyof ChatsResponse;
          const whatsapp = data[whatsappKey];
          if (typeof whatsapp === 'string' && whatsapp.trim() && whatsapp.trim() !== '') {
            setWhatsappUrl(whatsapp.trim());
          } else {
            setWhatsappUrl(null);
          }

          // Get Telegram URL
          const telegramKey = `chat_telegram_${langKey}` as keyof ChatsResponse;
          const telegram = data[telegramKey];
          if (typeof telegram === 'string' && telegram.trim() && telegram.trim() !== '') {
            setTelegramUrl(telegram.trim());
          } else {
            setTelegramUrl(null);
          }
        }
      } catch {
        if (isMounted) {
          setWhatsappUrl(null);
          setTelegramUrl(null);
        }
      }
    };

    fetchChatLinks();

    return () => {
      isMounted = false;
    };
  }, [resolveSocialLanguage]);

  const handleCallCenter = () => {
    onCallCenterClick();
    onClose();
  };

  const handleWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  const handleTelegram = () => {
    if (telegramUrl) {
      window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-32 sm:bottom-36 right-4 sm:right-16 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden min-w-[280px] sm:min-w-[320px]"
        >
          {/* Menu Items */}
          <div className="py-2">
            {/* Call Center */}
            <button
              onClick={handleCallCenter}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <span className="text-gray-900 font-medium text-base flex-1">
                {t('common.submitRequest')}
              </span>
            </button>

            {/* WhatsApp */}
            {whatsappUrl && (
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <span className="text-gray-900 font-medium text-base flex-1">
                  WhatsApp
                </span>
              </button>
            )}

            {/* Telegram */}
            {telegramUrl && (
              <button
                onClick={handleTelegram}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#0088CC] flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>
                <span className="text-gray-900 font-medium text-base flex-1">
                  Telegram
                </span>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactCommandMenu;

