import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import '@maptiler/leaflet-maptilersdk';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { branchMapService, type BranchMap } from '../../services/branchMapService';

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

const Location = () => {
  const { t, i18n } = useTranslation();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<MarkerClusterGroup | null>(null);
  // Store branch markers by coordinates for quick lookup
  // Key format: "lat,lng" -> marker
  const branchMarkersMap = useRef<Map<string, L.Marker>>(new Map());

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

  // Get valid branches list
  const branchesList = useMemo(() => {
    return branches.filter((b) => b.title_uz);
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
              <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-[10px] font-[400] text-[16px] sm:text-[18px] md:text-[22px] lg:text-[26px]">
                {branchesList.map((branch, index) => {
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
            )}
          </div>
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
