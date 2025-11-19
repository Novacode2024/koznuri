import { useState, useEffect } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { useTranslation } from 'react-i18next';
import image from "../../assets/icon-7797704_640.png"
import { getReviews } from "../../services/reviewService";
import type { Review } from "../../types/Review";
import ReviewModal from "../ReviewModal";
import "swiper/css"

const Messages = () => {
  const { i18n } = useTranslation();
  const [messages, setMessages] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getReviews();
      // Only confirmed reviews
      const confirmedReviews = data.filter(review => review.confirmed);
      setMessages(confirmedReviews);
    } catch {
      setError('Failed to load Reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const getCurrentLanguage = () => {
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

  const getDescription = (review: Review) => {
    const lang = getCurrentLanguage();
    const langKey = `description_${lang}` as keyof Review;
    return review[langKey] as string || review.description_uz;
  };

  if (loading) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-10 md:py-16">
          <div className="flex justify-center items-center h-40 md:h-64">
            <div className="text-base sm:text-lg md:text-xl text-gray-600">{i18n.t("reviews.loading")}</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || messages.length === 0) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-10 md:py-16">
          <div className="flex justify-center items-center h-40 md:h-64">
            <div className="text-base sm:text-lg md:text-xl text-red-600">{i18n.t("reviews.error")}</div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6">
      <div className="flex w-full max-w-[749px] flex-col gap-4 sm:gap-6 items-start flex-nowrap relative mt-4 md:mt-[19px] mr-0 mb-0 ml-0">
        <h2 className="text-[28px] sm:text-[36px] md:text-[54px] font-bold leading-[34px] sm:leading-[42px] md:leading-[58px] text-[#282828] relative text-left z-[1]">
          {i18n.t("reviews.title")}
        </h2>
        <p className="flex w-full text-[16px] sm:text-[20px] md:text-[27px] font-normal leading-[24px] sm:leading-[28px] md:leading-[35px] text-[#282828] relative text-left z-[2]">
          {i18n.t("reviews.subtitle")}
        </p>
      </div>
     <Swiper 
       spaceBetween={12} 
       slidesPerView={1} 
       pagination={{ clickable: true }} 
      className="mt-6 md:mt-[40px]"
       breakpoints={{
         640: {
           slidesPerView: 2,
           spaceBetween: 16,
         },
         768: {
           slidesPerView: 3,
           spaceBetween: 24,
         },
         1024: {
           slidesPerView: 4,
           spaceBetween: 30,
         },
       }}
     >
       {messages.map((message) => {
         // Get name from client field first, then name field, then fallback
         const clientName = message.client?.trim();
         const nameValue = message.name?.trim();
         const displayName = clientName || nameValue || 'Anonim foydalanuvchi';
         return (
         <SwiperSlide key={message.uuid}>
           <div className="bg-white my-5  h-auto md:h-[300px] rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <img src={message.image || image} alt={displayName} className="w-10 h-10 md:w-12 md:h-12 rounded-full" />
               <div>
                <h3 className="text-[16px] sm:text-[13px] md:text-[15px] font-bold text-[#282828]">{displayName}</h3>
               
               </div>
             </div>
            <p className="text-[14px] sm:text-[15px] md:text-[16px] text-[#666] leading-relaxed whitespace-pre-line">
               {getDescription(message)}
             </p>
           </div>
         </SwiperSlide>
       );
       })}
     </Swiper>
     <div className="flex justify-center mt-8 md:mt-12">
        <button 
          onClick={() => setIsReviewModalOpen(true)}
          className="w-full sm:w-[280px] md:w-[349px] h-12 sm:h-14 md:h-[82px] bg-[#1857fe] rounded-[5px] shadow-[0_17px_27px_0_rgba(24,87,254,0.3)] flex items-center justify-center hover:bg-[#0d47e8] transition-colors duration-200"
        >
          <span className="text-[16px] sm:text-[18px] md:text-[20px] font-bold text-white">
            {i18n.t("reviews.showAll")}
          </span>
        </button>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => {
          // Refresh reviews after successful submission
          fetchReviews();
        }}
      />
      </div>
    </div>
  )
}

export default Messages;