import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import '@maptiler/leaflet-maptilersdk';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { branchMapService, type BranchMap } from '../../services/branchMapService';
import api from '../../services/api';
import { sanitizeHtml } from '../../utils/sanitize';

// Type definition for MarkerClusterGroup
type MarkerClusterGroup = ReturnType<typeof L.markerClusterGroup>;

// Fix for default marker icons in Leaflet with Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const SOCIAL_KEYS = [
  'facebook',
  'instagram',
  'telegram',
  'youtube',
  'whatsapp',
  'linkedin',
  'tiktok',
  'chat_telegram',
  'chat_whatsapp',
] as const;

type SocialKey = typeof SOCIAL_KEYS[number];
type LanguageSuffix = 'uz' | 'ru' | 'en' | 'tj' | 'kz' | 'kg';
type SocialFieldKey = `${SocialKey}_${LanguageSuffix}`;
type SocialsResponse = Partial<Record<SocialFieldKey, string | null>>;

// Social Link Interface
interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

// Social Media Icons Mapping - Clean responsive SVG icons
const SOCIAL_ICONS: Record<string, string> = {
  facebook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1857FE" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>`,
  instagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1857FE" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>`,
  telegram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1857FE" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>`,
  youtube: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1857FE" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>`,
  whatsapp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1857FE" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1857FE" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>`,
  tiktok: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1857FE" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>`,
};

SOCIAL_ICONS.chat_telegram = SOCIAL_ICONS.telegram;
SOCIAL_ICONS.chat_whatsapp = SOCIAL_ICONS.whatsapp;

// Social Media Names Mapping
const SOCIAL_NAMES: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  telegram: 'Telegram',
  youtube: 'YouTube',
  whatsapp: 'WhatsApp',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  chat_telegram: 'Telegram Chat',
  chat_whatsapp: 'WhatsApp Chat',
};

const Location = () => {
  const { t, i18n } = useTranslation();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<MarkerClusterGroup | null>(null);
  // Store branch markers by coordinates for quick lookup
  // Key format: "lat,lng" -> marker
  const branchMarkersMap = useRef<Map<string, L.Marker>>(new Map());

  // Social links state
  const [socialData, setSocialData] = useState<SocialsResponse | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [socialLinksLoading, setSocialLinksLoading] = useState(true);

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

  // Fetch social links from API
  useEffect(() => {
    let isMounted = true;

    const fetchSocialLinks = async () => {
      try {
        setSocialLinksLoading(true);
        const data = await api.get<SocialsResponse>('/socials/', { skipAuth: true });
        if (isMounted) {
          setSocialData(data);
        }
      } catch {
        if (isMounted) {
          setSocialData(null);
          setSocialLinks([]);
        }
      } finally {
        if (isMounted) {
          setSocialLinksLoading(false);
        }
      }
    };

    fetchSocialLinks();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!socialData) {
      setSocialLinks([]);
      return;
    }

    const langKey = resolveSocialLanguage();
    const localizedLinks: SocialLink[] = [];

    SOCIAL_KEYS.forEach((key) => {
      const fieldKey = `${key}_${langKey}` as keyof SocialsResponse;
      const url = socialData[fieldKey];
      if (typeof url === 'string') {
        const trimmedUrl = url.trim();
        if (trimmedUrl) {
          const icon = SOCIAL_ICONS[key];
          const name = SOCIAL_NAMES[key];
          if (icon && name) {
            localizedLinks.push({
              name,
              url: trimmedUrl,
              icon,
            });
          }
        }
      }
    });

    setSocialLinks(localizedLinks);
  }, [socialData, resolveSocialLanguage]);

  // Get localized branch title
  const getBranchTitle = useCallback((branch: BranchMap): string => {
    const lang = i18n.language;
    const langMap: Record<string, keyof BranchMap> = {
      "uz-latin": "title_uz",
      "uz-cyrillic": "title_kr",
      uz: "title_uz",
      kr: "title_kr",
      ru: "title_uz", // fallback
      en: "title_uz", // fallback
      tg: "title_uz", // fallback
      kz: "title_uz", // fallback
      ky: "title_uz", // fallback
    };
    const titleKey = langMap[lang] || "title_uz";
    return branch[titleKey] || branch.title_uz;
  }, [i18n.language]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize map centered on Uzbekistan
    const map = L.map(mapContainerRef.current, {
      center: [41.3, 69.2], // Uzbekistan center coordinates
      zoom: 6,
      zoomControl: true,
    });

    // Add MapTiler tile layer (using OpenStreetMap as fallback)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Fetch branches and add markers
  useEffect(() => {
    if (!mapRef.current) return;

    const fetchBranches = async () => {
      try {
        const branches = await branchMapService.getBranchMaps();

        // Remove existing markers
        if (markersRef.current) {
          mapRef.current?.removeLayer(markersRef.current);
          markersRef.current = null;
        }

        // Filter branches with valid coordinates
        const validBranches = branches.filter(
          (branch) => branch.latitude && branch.longitude
        );

        if (validBranches.length === 0) return;

        // Create marker cluster group
        const markerClusterGroup = L.markerClusterGroup({
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
        });

        // Clear branch markers map
        branchMarkersMap.current.clear();

        // Add markers for each branch
        validBranches.forEach((branch) => {
          const lat = parseFloat(branch.latitude!);
          const lng = parseFloat(branch.longitude!);

          if (isNaN(lat) || isNaN(lng)) return;

          const marker = L.marker([lat, lng], {
            icon: DefaultIcon,
          });

          // Create popup content
          const popupContent = `
            <div style="min-width: 200px; padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1857FE;">
                ${getBranchTitle(branch)}
              </h3>
              ${branch.map_embed ? `
                <div style="margin-top: 8px; width: 100%; max-width: 300px;">
                  <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
                    ${branch.map_embed}
                  </div>
                </div>
              ` : ''}
            </div>
          `;

          marker.bindPopup(popupContent, {
            maxWidth: 350,
            className: 'custom-popup',
          });

          // Store marker by coordinates for quick lookup (language-independent)
          // Round coordinates to 6 decimal places for consistency (about 0.1m precision)
          const roundedLat = Math.round(lat * 1000000) / 1000000;
          const roundedLng = Math.round(lng * 1000000) / 1000000;
          const markerKey = `${roundedLat},${roundedLng}`;
          branchMarkersMap.current.set(markerKey, marker);

          markerClusterGroup.addLayer(marker);
        });

        // Add marker cluster group to map
        mapRef.current?.addLayer(markerClusterGroup);
        markersRef.current = markerClusterGroup;

        // Fit map to show all markers
        if (validBranches.length > 0) {
          const bounds = markerClusterGroup.getBounds();
          if (bounds.isValid()) {
            mapRef.current?.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 8,
            });
          }
        }
      } catch {
        // Silent fail - branches are optional
      }
    };

    fetchBranches();
  }, [i18n.language, getBranchTitle]);

  // Get branches list for display
  const [branches, setBranches] = useState<BranchMap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const data = await branchMapService.getBranchMaps();
        setBranches(data);
      } catch {
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  // Split branches into two columns
  const branchesList = useMemo(() => {
    const validBranches = branches.filter((b) => b.title_uz);
    const midPoint = Math.ceil(validBranches.length / 2);
    return {
      left: validBranches.slice(0, midPoint),
      right: validBranches.slice(midPoint),
    };
  }, [branches]);

  // Helper function to focus on marker and open popup
  const focusOnMarker = useCallback((marker: L.Marker) => {
    if (!mapRef.current || !marker) return;

    // Get marker position
    const latlng = marker.getLatLng();

    // Zoom to marker with animation
    mapRef.current.setView(latlng, 13, {
      animate: true,
      duration: 0.5,
    });

    // Open popup after zoom animation
    setTimeout(() => {
      marker.openPopup();
    }, 600);
  }, []);

  // Handle branch click - focus on marker in map
  const handleBranchClick = useCallback((branch: BranchMap) => {
    if (!mapRef.current || !branch.latitude || !branch.longitude) return;

    const lat = parseFloat(branch.latitude);
    const lng = parseFloat(branch.longitude);

    if (isNaN(lat) || isNaN(lng)) return;

    // Find marker by coordinates (language-independent)
    // Round coordinates to 6 decimal places for consistency (about 0.1m precision)
    const roundedLat = Math.round(lat * 1000000) / 1000000;
    const roundedLng = Math.round(lng * 1000000) / 1000000;
    const markerKey = `${roundedLat},${roundedLng}`;
    const marker = branchMarkersMap.current.get(markerKey);

    if (!marker) return;

    // Scroll to map container on mobile/tablet (only if map is not visible)
    const mapElement = document.getElementById('map');
    if (mapElement) {
      const rect = mapElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const isVisible = rect.top >= 0 && rect.top < viewportHeight && rect.bottom > 0;
      
      // Only scroll if map is not fully visible
      if (!isVisible) {
        mapElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // Wait for scroll to complete
        setTimeout(() => {
          focusOnMarker(marker);
        }, 500);
      } else {
        // Map is already visible, focus immediately
        focusOnMarker(marker);
      }
    } else {
      // Fallback if map element not found - try to scroll using ref
      if (mapContainerRef.current) {
        mapContainerRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        setTimeout(() => {
          focusOnMarker(marker);
        }, 500);
      } else {
        focusOnMarker(marker);
      }
    }
  }, [focusOnMarker]);

  return (
    <div className="w-full max-w-full overflow-x-hidden px-4 sm:px-6">
      <div className="max-w-[1380px] my-[20px] w-full h-auto min-h-[500px] sm:min-h-[600px] md:min-h-[700px] lg:h-[800px] bg-white mx-auto overflow-hidden rounded-[12px] md:rounded-[16px] lg:rounded-[20px] shadow-lg flex flex-col lg:flex-row">
        {/* Left Column - Branches List & Social Links */}
        <div className="w-full lg:w-[35%] p-4 sm:p-6 md:p-8 lg:p-[50px] bg-gradient-to-br from-blue-50 to-white flex flex-col justify-between">
          <div className="flex flex-col gap-4 sm:gap-5 md:gap-[20px]">
            <h1 className="text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] font-bold text-[#1857FE]">
              {t("statistics.branches.title")}
            </h1>
            {loading ? (
              <div className="text-gray-500">{t("common.loading")}</div>
            ) : (
              <div className="flex justify-between gap-6 sm:gap-8 md:gap-10">
                <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-[10px] font-[400] text-[16px] sm:text-[18px] md:text-[22px] lg:text-[26px]">
                  {branchesList.left.map((branch, index) => {
                    const branchTitle = getBranchTitle(branch);
                    const hasCoordinates = branch.latitude && branch.longitude;
                    
                    return (
                      <a
                        key={index}
                        href="#map"
                        onClick={(e) => {
                          e.preventDefault();
                          if (hasCoordinates) {
                            handleBranchClick(branch);
                          }
                        }}
                        className={`text-gray-800 hover:text-[#1857FE] transition-colors cursor-pointer ${
                          hasCoordinates 
                            ? 'hover:underline' 
                            : 'cursor-default opacity-60'
                        }`}
                        title={hasCoordinates ? t('common.viewOnMap') || 'Xaritada ko\'rish' : ''}
                      >
                        {branchTitle}
                      </a>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-[10px] font-[400] text-[16px] sm:text-[18px] md:text-[22px] lg:text-[26px]">
                  {branchesList.right.map((branch, index) => {
                    const branchTitle = getBranchTitle(branch);
                    const hasCoordinates = branch.latitude && branch.longitude;
                    
                    return (
                      <a
                        key={index}
                        href="#map"
                        onClick={(e) => {
                          e.preventDefault();
                          if (hasCoordinates) {
                            handleBranchClick(branch);
                          }
                        }}
                        className={`text-gray-800 hover:text-[#1857FE] transition-colors cursor-pointer ${
                          hasCoordinates 
                            ? 'hover:underline' 
                            : 'cursor-default opacity-60'
                        }`}
                        title={hasCoordinates ? t('common.viewOnMap') || 'Xaritada ko\'rish' : ''}
                      >
                        {branchTitle}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Social Links - Flexible responsive layout */}
          {!socialLinksLoading && socialLinks.length > 0 && (
            <div className="w-full mt-4 sm:mt-6">
              <div className="flex flex-wrap gap-2 sm:gap-2.5 md:gap-3 lg:gap-3.5 items-center justify-start">
                {socialLinks.map((link, index) => (
                  <a
                    key={`${link.name}-${index}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 bg-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1857FE] focus:ring-offset-2"
                    title={link.name}
                    aria-label={link.name}
                    style={{
                      width: 'clamp(36px, 8vw, 56px)',
                      height: 'clamp(36px, 8vw, 56px)',
                      padding: 'clamp(6px, 1.5vw, 10px)',
                    }}
                  >
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        minWidth: '24px',
                        minHeight: '24px',
                      }}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(link.icon) }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Map */}
        <div id="map" className="w-full lg:w-[65%] p-2 bg-gray-50">
          <div
            ref={mapContainerRef}
            className="w-full h-full min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:h-full rounded-lg shadow-md"
            style={{ zIndex: 0 }}
          />
        </div>
      </div>
    </div>
  );
};

export default Location;
