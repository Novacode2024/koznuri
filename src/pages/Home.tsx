import Header from "../components/HomeComponents/Header"
import Status from "../components/HomeComponents/Status"
import Info from "../components/HomeComponents/Info"
import Servis from "../components/HomeComponents/Servis"
import SwiperCondetions from "../components/HomeComponents/SwiperCondetions"
import WhereDoctors from "../components/HomeComponents/WhereDoctors"
import Contact from "../components/HomeComponents/Contact"
import YoutubeSwiper from "../components/HomeComponents/YoutubeSwiper"
import News from "../components/HomeComponents/News"
import Messages from "../components/HomeComponents/Messages"
import FAQ from "../components/HomeComponents/FAQ"
import SEO from "../components/SEO"
import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useTranslation } from "react-i18next";

const Location = lazy(() => import("../components/HomeComponents/Location"));
const Home = () => {
  const { t } = useTranslation();
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Ko'z Nuri - Eye Medical Center",
    "url": "https://koznuri.novacode.uz",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://koznuri.novacode.uz/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
  
  const seoTitle = t("seo.homeTitle");
  const seoDescription = t("seo.homeDescription");
  const seoKeywords = t("seo.homeKeywords");

  return (
    <>
      <SEO
        title={seoTitle && seoTitle.trim() ? seoTitle : "Ko'z Nuri - O'zbekistondagi Yetakchi Ko'z Tibbiy Markazi | Lazer Korreksiyasi, Katarakta, Glaukoma"}
        description={seoDescription && seoDescription.trim() ? seoDescription : "Ko'z Nuri klinikasi - O'zbekistondagi eng zamonaviy ko'z tibbiy xizmatlari. Lazer korreksiyasi, katarakta, glaukoma, retina operatsiyalari va boshqa ko'z kasalliklarini davolash. 20 yillik tajriba, yuqori malakali shifokorlar. Toshkent, O'zbekiston."}
        keywords={seoKeywords && seoKeywords.trim() ? seoKeywords : "ko'z tibbiy markazi, ko'z shifokori, lazer korreksiyasi, katarakta operatsiyasi, glaukoma davolash, retina operatsiyasi, oftalmolog, Toshkent, O'zbekiston, ko'z kasalliklari, ko'z diagnostikasi"}
        canonical="https://koznuri.novacode.uz/"
        structuredData={structuredData}
      />
      <div>
        <Header />
        <Status />
        <Info />
        <Servis />
        <SwiperCondetions />
        <WhereDoctors />
        <Contact />
        <YoutubeSwiper />
        <News />
        <div id="reviews" className="scroll-mt-20">
          <Messages />
        </div>
        <FAQ />
        <div id="location" className="scroll-mt-20">
          <Suspense fallback={<LoadingSpinner />}>
            <Location />
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default Home;