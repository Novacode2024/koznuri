import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getFaqs } from '../../services/faqService';
import type { FAQ } from '../../types/FAQ';

const FAQ = () => {
  const { t, i18n } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [faqData, setFaqData] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const data = await getFaqs();
        setFaqData(data);
        // Open first FAQ by default
        if (data.length > 0) {
          setExpandedId(data[0].uuid);
        }
      } catch {
        setError(t('faq.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, [t]);

  // Map i18n language to API language codes
  const getCurrentLanguage = (): string => {
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
  };

  // Get question text based on current language
  const getQuestion = (faq: FAQ): string => {
    const lang = getCurrentLanguage();
    const langKey = `question_${lang}` as keyof FAQ;
    const question = faq[langKey] as string;
    
    // Fallback to other languages if current language not available
    return question || faq.question_uz || faq.question_ru || faq.question_en || '';
  };

  // Get answer text based on current language
  const getAnswer = (faq: FAQ): string => {
    const lang = getCurrentLanguage();
    const langKey = `answer_${lang}` as keyof FAQ;
    const answer = faq[langKey] as string;
    
    // Fallback to other languages if current language not available
    return answer || faq.answer_uz || faq.answer_ru || faq.answer_en || '';
  };

  const toggleExpanded = (uuid: string) => {
    setExpandedId(expandedId === uuid ? null : uuid);
  };

  if (loading) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="flex justify-center items-center h-48 sm:h-56 md:h-64">
            <div className="text-base sm:text-lg md:text-xl text-gray-600">{t('faq.loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="flex justify-center items-center h-48 sm:h-56 md:h-64">
            <div className="text-base sm:text-lg md:text-xl text-red-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (faqData.length === 0) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="mb-6 sm:mb-8 md:mb-12 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[54px] leading-tight sm:leading-snug md:leading-[44px] lg:leading-[58px] text-[#0A0933] mb-4 sm:mb-5 md:mb-6">
              {t('faq.title')}
            </h2>
          </div>
          <div className="flex justify-center items-center h-48 sm:h-56 md:h-64">
            <div className="text-base sm:text-lg md:text-xl text-gray-600">{t('faq.noResults')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8 md:mb-12 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[54px] leading-tight sm:leading-snug md:leading-[44px] lg:leading-[58px] text-[#0A0933] mb-4 sm:mb-5 md:mb-6">
          {t('faq.title')}
        </h2>
      </div>

      {/* FAQ Items */}
      <div className="w-full md:w-[92%] lg:w-[1080px] mx-auto space-y-3 sm:space-y-4">
        {faqData.map((item, index) => (
          <motion.div
            key={item.uuid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Question */}
            <motion.button
              onClick={() => toggleExpanded(item.uuid)}
              className={`w-full px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5 text-left flex items-center justify-between transition-colors ${
                expandedId === item.uuid
                  ? 'bg-[#1857FE] text-white'
                  : 'bg-white text-[#0A0933] hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2 }}
              aria-expanded={expandedId === item.uuid}
              aria-controls={`faq-answer-${item.uuid}`}
            >
              <h3 className="text-base sm:text-lg md:text-xl lg:text-[24px] pr-3 sm:pr-4">
                {getQuestion(item)}
              </h3>
              <motion.div 
                className={`flex-shrink-0 rounded-full p-1.5 sm:p-2 md:p-2.5 ${
                  expandedId === item.uuid ? 'bg-white' : 'bg-[#1857FE]'
                }`}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <motion.svg
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                  fill="none"
                  stroke={expandedId === item.uuid ? '#1857FE' : '#FFFFFF'}
                  viewBox="0 0 24 24"
                  animate={{ rotate: expandedId === item.uuid ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </motion.div>
            </motion.button>

            {/* Answer */}
            <AnimatePresence>
              {expandedId === item.uuid && (
                <motion.div
                  id={`faq-answer-${item.uuid}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5 bg-white border-t border-gray-100"
                  >
                    <p className="text-sm sm:text-base md:text-lg lg:text-[18px] text-[#000] leading-relaxed whitespace-pre-line">
                      {getAnswer(item)}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      </div>
    </div>
  );
}

export default FAQ;