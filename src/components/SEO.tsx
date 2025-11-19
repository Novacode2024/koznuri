import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  structuredData?: object | object[] | null;
  noindex?: boolean;
  canonical?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  type = "website",
  structuredData,
  noindex = false,
  canonical,
}) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  
  const baseUrl = "https://koznuri.novacode.uz";
  const currentUrl = `${baseUrl}${location.pathname}${location.search}`;
  const canonicalUrl = canonical || currentUrl;
  
  // Default values
  const defaultTitle = t("seo.defaultTitle") || "Ko'z Nuri - O'zbekistondagi Yetakchi Ko'z Tibbiy Markazi | Lazer Korreksiyasi, Katarakta, Glaukoma";
  const defaultDescription = t("seo.defaultDescription") || "Ko'z Nuri klinikasi - O'zbekistondagi eng zamonaviy ko'z tibbiy xizmatlari. Lazer korreksiyasi, katarakta, glaukoma, retina operatsiyalari va boshqa ko'z kasalliklarini davolash. 20 yillik tajriba, yuqori malakali shifokorlar.";
  const defaultKeywords = t("seo.defaultKeywords") || "ko'z tibbiy markazi, ko'z shifokori, lazer korreksiyasi, katarakta operatsiyasi, glaukoma davolash, retina operatsiyasi, oftalmolog, Toshkent, O'zbekiston";
  const defaultImage = `${baseUrl}/logo.svg`;
  
  // Check if title is valid (not empty, not a translation key)
  const isValidTitle = title && title.trim() && !title.startsWith("seo.");
  const finalTitle = isValidTitle ? `${title} | Ko'z Nuri` : defaultTitle;
  
  // Check if description is valid (not empty, not a translation key)
  const isValidDescription = description && description.trim() && !description.startsWith("seo.");
  const finalDescription = isValidDescription ? description : defaultDescription;
  
  // Check if keywords is valid (not empty, not a translation key)
  const isValidKeywords = keywords && keywords.trim() && !keywords.startsWith("seo.");
  const finalKeywords = isValidKeywords ? keywords : defaultKeywords;
  
  const finalImage = image || defaultImage;
  
  // Language mapping for hreflang
  const languageMap: Record<string, string> = {
    "uz-latin": "uz-latn",
    "uz-cyrillic": "uz-cyrl",
    ru: "ru",
    en: "en",
    kz: "kz",
    ky: "ky",
    tg: "tg",
  };
  
  const currentLang = languageMap[i18n.language] || "uz-latn";
  
  // Default structured data
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "name": "Ko'z Nuri - Eye Medical Center",
    "alternateName": "Ko'z Nuri",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.svg`,
    "image": `${baseUrl}/logo.svg`,
    "description": defaultDescription,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Buyuk ipak yo'li ko'chasi, 160А",
      "addressLocality": "Toshkent",
      "addressRegion": "Mirzo-Ulug'bek tumani",
      "addressCountry": "UZ",
      "postalCode": "100000"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+998-55-514-03-33",
      "contactType": "customer service",
      "areaServed": "UZ",
      "availableLanguage": ["uz", "ru", "en", "kz", "ky", "tg"]
    },
    "areaServed": {
      "@type": "Country",
      "name": "Uzbekistan"
    },
    "medicalSpecialty": "Ophthalmology",
    "priceRange": "$$",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "08:00",
        "closes": "21:00"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/koznuri",
      "https://www.instagram.com/koznuri",
      "https://www.youtube.com/koznuri"
    ]
  };
  
  // Combine structured data
  const allStructuredData = structuredData
    ? Array.isArray(structuredData)
      ? [defaultStructuredData, ...structuredData]
      : [defaultStructuredData, structuredData]
    : [defaultStructuredData];
  
  // Update document head
  useEffect(() => {
    // Update title
    document.title = finalTitle;
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = "name") => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };
    
    // Primary meta tags
    updateMetaTag("title", finalTitle);
    updateMetaTag("description", finalDescription);
    if (finalKeywords) {
      updateMetaTag("keywords", finalKeywords);
    }
    updateMetaTag("author", "Ko'z Nuri - Eye Medical Center");
    updateMetaTag(
      "robots",
      noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );
    updateMetaTag("language", "Uzbek");
    updateMetaTag("geo.region", "UZ");
    updateMetaTag("geo.placename", "Tashkent, Uzbekistan");
    updateMetaTag("geo.position", "41.2995;69.2401");
    
    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;
    
    // Open Graph tags
    updateMetaTag("og:type", type, "property");
    updateMetaTag("og:url", currentUrl, "property");
    updateMetaTag("og:title", finalTitle, "property");
    updateMetaTag("og:description", finalDescription, "property");
    updateMetaTag("og:image", finalImage, "property");
    updateMetaTag("og:image:secure_url", finalImage, "property");
    updateMetaTag("og:image:type", image?.endsWith(".svg") ? "image/svg+xml" : "image/jpeg", "property");
    updateMetaTag("og:image:width", "1200", "property");
    updateMetaTag("og:image:height", "630", "property");
    updateMetaTag("og:image:alt", finalTitle, "property");
    updateMetaTag("og:site_name", "Ko'z Nuri - Eye Medical Center", "property");
    updateMetaTag("og:locale", currentLang === "uz-latn" ? "uz_UZ" : currentLang === "uz-cyrl" ? "uz_UZ" : `${currentLang}_${currentLang.toUpperCase()}`, "property");
    
    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:site", "@koznuri");
    updateMetaTag("twitter:creator", "@koznuri");
    updateMetaTag("twitter:url", currentUrl);
    updateMetaTag("twitter:title", finalTitle);
    updateMetaTag("twitter:description", finalDescription);
    updateMetaTag("twitter:image", finalImage);
    updateMetaTag("twitter:image:alt", finalTitle);
    updateMetaTag("twitter:image:width", "1200");
    updateMetaTag("twitter:image:height", "630");
    
    // Hreflang links
    const langs = ["uz-latn", "uz-cyrl", "ru", "en", "kz", "ky", "tg"];
    langs.forEach((lang) => {
      const langParam = lang === "uz-latn" ? "uz-latin" : lang === "uz-cyrl" ? "uz-cyrillic" : lang;
      const url = lang === "uz-latn" && !location.search.includes("lang=")
        ? canonicalUrl
        : `${baseUrl}${location.pathname}?lang=${langParam}`;
      
      let hreflangLink = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`) as HTMLLinkElement;
      if (!hreflangLink) {
        hreflangLink = document.createElement("link");
        hreflangLink.rel = "alternate";
        hreflangLink.hreflang = lang;
        document.head.appendChild(hreflangLink);
      }
      hreflangLink.href = url;
    });
    
    // x-default hreflang
    let defaultHreflang = document.querySelector('link[rel="alternate"][hreflang="x-default"]') as HTMLLinkElement;
    if (!defaultHreflang) {
      defaultHreflang = document.createElement("link");
      defaultHreflang.rel = "alternate";
      defaultHreflang.hreflang = "x-default";
      document.head.appendChild(defaultHreflang);
    }
    defaultHreflang.href = `${baseUrl}${location.pathname}`;
    
    // Structured Data (JSON-LD)
    // Remove existing structured data scripts
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach((script) => script.remove());
    
    // Add new structured data
    allStructuredData.forEach((data) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    });
  }, [
    finalTitle,
    finalDescription,
    finalKeywords,
    finalImage,
    type,
    currentUrl,
    canonicalUrl,
    currentLang,
    noindex,
    location.pathname,
    location.search,
    allStructuredData,
    image,
  ]);
  
  return null;
};

export default SEO;
