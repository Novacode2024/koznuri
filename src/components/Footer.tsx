import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LogoIcon from '../assets/logo.png';
import { useCompanyPhones } from '../hooks/useCompanyPhones';
import { useCompanyAddresses } from '../hooks/useCompanyAddresses';
import { useCompanyEmail } from '../hooks/useCompanyEmail';
import { useCompanyInfo } from '../hooks/useCompanyInfo';
import { useWorkTimes } from '../hooks/useWorkTimes';
import AppointmentFormModal from './AppointmentFormModal';
import type { CompanyAddress } from '../services/companyAddressesService';
import type { WorkTime } from '../services/workTimesService';
import api from '../services/api';
import { sanitizeHtml } from '../utils/sanitize';

// Types
interface NavigationLink {
  text: string;
  href: string;
  hasDropdown: boolean;
  submenu: Array<{ text: string; href: string }>;
}

interface ContactItem {
  icon: React.ReactNode;
  label: string;
  value: string;
}

// Social Links Types
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

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

// Social Media Icons Mapping
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

// Icon Components - Optimized small sizes like Navbar
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 47 47" fill="none" className="flex-shrink-0">
    <path d="M36.6999 11.54H9.86654C7.74944 11.54 6.0332 13.2563 6.0332 15.3734V36.4567C6.0332 38.5738 7.74944 40.29 9.86654 40.29H36.6999C38.817 40.29 40.5332 38.5738 40.5332 36.4567V15.3734C40.5332 13.2563 38.817 11.54 36.6999 11.54Z" stroke="white" strokeWidth="1.91667"/>
    <path d="M6.0332 19.2067C6.0332 15.5919 6.0332 13.7864 7.15637 12.6632C8.27954 11.54 10.085 11.54 13.6999 11.54H32.8665C36.4814 11.54 38.2869 11.54 39.41 12.6632C40.5332 13.7864 40.5332 15.5919 40.5332 19.2067H6.0332Z" fill="white"/>
    <path d="M13.7002 5.79004V11.54M32.8669 5.79004V11.54" stroke="white" strokeWidth="1.91667" strokeLinecap="round"/>
    <path d="M20.4085 23.04H14.6585C14.1293 23.04 13.7002 23.4691 13.7002 23.9984V25.915C13.7002 26.4443 14.1293 26.8734 14.6585 26.8734H20.4085C20.9378 26.8734 21.3669 26.4443 21.3669 25.915V23.9984C21.3669 23.4691 20.9378 23.04 20.4085 23.04Z" fill="white"/>
    <path d="M20.4085 30.707H14.6585C14.1293 30.707 13.7002 31.1361 13.7002 31.6654V33.582C13.7002 34.1113 14.1293 34.5404 14.6585 34.5404H20.4085C20.9378 34.5404 21.3669 34.1113 21.3669 33.582V31.6654C21.3669 31.1361 20.9378 30.707 20.4085 30.707Z" fill="white"/>
    <path d="M31.9085 23.04H26.1585C25.6293 23.04 25.2002 23.4691 25.2002 23.9984V25.915C25.2002 26.4443 25.6293 26.8734 26.1585 26.8734H31.9085C32.4378 26.8734 32.8669 26.4443 32.8669 25.915V23.9984C32.8669 23.4691 32.4378 23.04 31.9085 23.04Z" fill="white"/>
    <path d="M31.9085 30.707H26.1585C25.6293 30.707 25.2002 31.1361 25.2002 31.6654V33.582C25.2002 34.1113 25.6293 34.5404 26.1585 34.5404H31.9085C32.4378 34.5404 32.8669 34.1113 32.8669 33.582V31.6654C32.8669 31.1361 32.4378 30.707 31.9085 30.707Z" fill="white"/>
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 23" fill="none" className="flex-shrink-0">
    <path d="M11.7719 1.21777V2.6811C13.2192 2.6811 14.5751 3.04693 15.8397 3.77859C17.0432 4.49501 18.0031 5.45531 18.7191 6.6595C19.4504 7.92467 19.8161 9.28129 19.8161 10.7294H21.2786C21.2786 9.00692 20.8444 7.40641 19.976 5.92784C19.1381 4.49501 18.0031 3.35941 16.571 2.52104C15.0931 1.6522 13.4934 1.21777 11.7719 1.21777ZM4.20759 3.41276C3.79624 3.41276 3.43821 3.54232 3.13351 3.80145L0.77967 6.20222L0.848228 6.15649C0.467348 6.47659 0.215968 6.8729 0.094086 7.34544C-0.0125604 7.81797 0.01791 8.27526 0.185497 8.7173C0.612083 9.90625 1.1834 11.1257 1.89946 12.3756C2.90498 14.0981 4.10094 15.6452 5.48735 17.0171C7.71169 19.2578 10.4769 21.026 13.7829 22.3216H13.8058C14.2476 22.4741 14.6894 22.5045 15.1312 22.4131C15.5883 22.3216 15.992 22.1235 16.3424 21.8186L18.6506 19.5093C18.9553 19.2044 19.1076 18.831 19.1076 18.3889C19.1076 17.9317 18.9553 17.5506 18.6506 17.2457L15.6568 14.2276C15.3521 13.9228 14.9713 13.7703 14.5142 13.7703C14.0571 13.7703 13.6763 13.9228 13.3716 14.2276L11.9318 15.6909C10.774 15.1422 9.76844 14.4639 8.91527 13.656C8.06209 12.8329 7.38413 11.8345 6.88137 10.6608L8.34395 9.19745C8.66389 8.86211 8.82385 8.46579 8.82385 8.0085C8.82385 7.53597 8.64103 7.1549 8.27539 6.86528L8.34395 6.93388L5.28167 3.80145C4.97697 3.54232 4.61894 3.41276 4.20759 3.41276ZM11.7719 4.14442V5.60774C12.7012 5.60774 13.5544 5.83638 14.3314 6.29367C15.1236 6.75096 15.7483 7.37592 16.2053 8.16855C16.6624 8.94594 16.8909 9.79955 16.8909 10.7294H18.3535C18.3535 9.54042 18.0564 8.43531 17.4622 7.41403C16.868 6.42324 16.0758 5.6306 15.0855 5.03613C14.0648 4.44166 12.9602 4.14442 11.7719 4.14442ZM4.20759 4.87608C4.2533 4.87608 4.30662 4.89894 4.36756 4.94467L7.36128 8.0085C7.37651 8.06948 7.36128 8.12283 7.31557 8.16855L5.14455 10.3178L5.30452 10.7751L5.60161 11.4153C5.84537 11.9336 6.12722 12.4366 6.44716 12.9244C6.88898 13.6103 7.37651 14.1971 7.90974 14.6849C8.6258 15.3861 9.48659 16.0263 10.4921 16.6055C10.9949 16.8951 11.4215 17.1085 11.7719 17.2457L12.2289 17.4515L14.4456 15.2337C14.4761 15.2032 14.499 15.1879 14.5142 15.1879C14.5294 15.1879 14.5523 15.2032 14.5828 15.2337L17.6679 18.3204C17.6984 18.3508 17.7136 18.3737 17.7136 18.3889C17.7136 18.3889 17.6984 18.4042 17.6679 18.4347L15.3826 20.6983C15.0474 20.9879 14.6818 21.0641 14.2857 20.9269C11.1777 19.7227 8.58771 18.0765 6.51572 15.9882C5.23597 14.7078 4.11618 13.2521 3.15636 11.6211C2.47078 10.4474 1.93755 9.31178 1.55667 8.21428V8.19142C1.49572 8.05423 1.48811 7.89418 1.53381 7.71127C1.57952 7.51311 1.66331 7.36068 1.78519 7.25398L4.04762 4.94467C4.09333 4.89894 4.14665 4.87608 4.20759 4.87608ZM11.7719 7.07106V8.53439C12.3813 8.53439 12.8993 8.74779 13.3259 9.17459C13.7524 9.60139 13.9657 10.1197 13.9657 10.7294H15.4283C15.4283 10.0739 15.2607 9.4642 14.9256 8.90022C14.6056 8.33623 14.1638 7.89418 13.6001 7.57408C13.0364 7.23874 12.427 7.07106 11.7719 7.07106Z" fill="currentColor"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 26 26" fill="none" className="flex-shrink-0">
    <path d="M23.592 3.5676C23.3675 3.38123 23.0967 3.25917 22.8084 3.21442C22.52 3.16966 22.225 3.20388 21.9545 3.31343L3.29098 10.8478C2.98939 10.9717 2.73262 11.1845 2.55477 11.4578C2.37692 11.7311 2.28639 12.052 2.2952 12.3779C2.30402 12.7039 2.41176 13.0194 2.60413 13.2827C2.79649 13.546 3.06438 13.7445 3.37223 13.852L7.39932 15.2499L9.58161 22.4645C9.58577 22.4791 9.59931 22.4884 9.60556 22.502C9.62834 22.5594 9.66114 22.6123 9.70244 22.6582C9.76593 22.7283 9.84731 22.7798 9.93786 22.8072C9.94827 22.8113 9.95557 22.8207 9.96598 22.8228H9.97223L9.97536 22.8238C10.056 22.8411 10.1397 22.8368 10.2181 22.8113L10.2441 22.8061C10.3193 22.7796 10.3873 22.7361 10.4431 22.6791C10.4493 22.6718 10.4597 22.6707 10.466 22.6645L13.6045 19.1999L18.1847 22.7468C18.4629 22.9645 18.8056 23.0822 19.1587 23.0822C19.9233 23.0822 20.5826 22.5468 20.7399 21.7999L24.1379 5.11448C24.1958 4.83122 24.1757 4.53752 24.0795 4.26485C23.9834 3.99217 23.8149 3.75079 23.592 3.56656M10.7201 16.6197L9.98369 20.1999L8.44723 15.1186L16.067 11.1499L10.8618 16.3561C10.7898 16.4282 10.7406 16.5199 10.7201 16.6197ZM19.7191 21.5905C19.6995 21.685 19.656 21.7728 19.5927 21.8456C19.5294 21.9184 19.4485 21.9737 19.3576 22.0061C19.2689 22.0397 19.1731 22.0499 19.0793 22.0357C18.9855 22.0214 18.897 21.9833 18.8222 21.9249L13.8608 18.0822C13.7571 18.0021 13.627 17.9641 13.4965 17.9757C13.366 17.9873 13.2446 18.0476 13.1566 18.1447L10.9722 20.552L11.7076 16.9822L19.1962 9.4926C19.2839 9.40461 19.3372 9.28818 19.3466 9.16431C19.356 9.04044 19.3208 8.91729 19.2474 8.81708C19.174 8.71688 19.0672 8.64621 18.9462 8.61785C18.8253 8.58948 18.6982 8.60528 18.5879 8.66239L7.79307 14.2853L3.71286 12.8666C3.605 12.8303 3.51099 12.7616 3.44368 12.6699C3.37636 12.5781 3.33904 12.4678 3.33682 12.3541C3.33131 12.2391 3.36189 12.1252 3.42427 12.0285C3.48666 11.9317 3.57772 11.8569 3.68473 11.8145L22.3451 4.2801C22.4409 4.23995 22.5458 4.22707 22.6484 4.24288C22.751 4.25869 22.8472 4.30258 22.9264 4.36968C23.0052 4.43298 23.0647 4.51706 23.0982 4.61241C23.1317 4.70777 23.1379 4.8106 23.116 4.90927L19.7191 21.5905Z" fill="currentColor"/>
  </svg>
);

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="m22 6-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


// Sub Components
const ContactItem = ({ icon, label, value }: ContactItem) => {
  const isEmail = label.toLowerCase().includes('email') || value.includes('@');
  const displayValue = value || '-';
  
  return (
    <div className="flex items-start gap-2 md:gap-2.5 text-gray-700 flex-shrink-0 flex-[1_1_calc(50%-0.25rem)] md:flex-initial lg:flex-[1_1_calc(50%-0.25rem)] xl:flex-initial min-w-0 max-w-full md:max-w-none">
      <div className="w-4 h-4 md:w-4 md:h-4 flex-shrink-0 flex items-center justify-center mt-0.5 text-gray-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-xs md:text-sm font-medium block">{label}</span>
        {isEmail && value ? (
          <a 
            href={`mailto:${value}`}
            className="text-xs md:text-sm text-[#1857FE] hover:text-[#0d47e8] transition-colors break-words"
          >
            {displayValue}
          </a>
        ) : (
          <p className="text-xs md:text-sm break-words">{displayValue}</p>
        )}
      </div>
    </div>
  );
};

const NavigationLink = ({ link }: { link: NavigationLink }) => (
  <div>
    <NavLink
      to={link.href}
      className={({ isActive }) =>
        `block text-gray-700 hover:text-[#1857FE] transition-colors duration-200 font-medium mb-1 ${
          isActive ? 'text-[#1857FE]' : ''
        }`
      }
    >
      {link.text}
    </NavLink>
    {link.hasDropdown && link.submenu.length > 0 && (
      <div className="ml-4 mt-1 space-y-1">
        {link.submenu.map((subItem, idx) => (
          <NavLink
            key={idx}
            to={subItem.href}
            className={({ isActive }) =>
              `block text-sm text-gray-600 hover:text-[#1857FE] transition-colors duration-200 ${
                isActive ? 'text-[#1857FE]' : ''
              }`
            }
          >
            {subItem.text}
          </NavLink>
        ))}
      </div>
    )}
  </div>
);


// Main Component
const Footer = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const { data: companyPhones, loading: phonesLoading } = useCompanyPhones();
  const { data: companyAddresses, loading: addressesLoading } = useCompanyAddresses();
  const { data: companyEmail } = useCompanyEmail();
  const { data: companyInfo } = useCompanyInfo();
  const { data: workTimes, loading: workTimesLoading } = useWorkTimes();

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

  const handleScrollToLocation = useCallback(() => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('location');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById('location');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.pathname, navigate]);
  const navigationLinks: NavigationLink[] = useMemo(
    () => [
      { text: t('footer.services'), href: '/services', hasDropdown: false, submenu: [] },
      {
        text: t('footer.about'),
        href: '/about',
        hasDropdown: true,
        submenu: [
          { text: t('footer.about'), href: '/about' },
          { text: t('footer.ourDoctors'), href: '/doctors' },
          { text: t('footer.technologies'), href: '/technologies' },
        ],
      },
      { text: t('common.news'), href: '/news', hasDropdown: false, submenu: [] },
      { text: t('footer.faq'), href: '/faq', hasDropdown: false, submenu: [] },
      { text: t('footer.location'), href: '/location', hasDropdown: false, submenu: [] },
      { text: t('footer.reviews'), href: '/reviews', hasDropdown: false, submenu: [] },
      { text: t('footer.media'), href: '/media', hasDropdown: false, submenu: [] },
      { text: t('footer.usageGuide'), href: '/usage', hasDropdown: false, submenu: [] },
    ],
    [t]
  );

  // Format phone numbers from API
  const phoneNumbers = useMemo(() => {
    if (!companyPhones || companyPhones.length === 0) {
      return [];
    }

    // Sort by order if available
    return [...companyPhones].sort((a, b) => {
      const orderA = (a as { order?: number }).order ?? 0;
      const orderB = (b as { order?: number }).order ?? 0;
      return orderA - orderB;
    });
  }, [companyPhones]);

  // Map i18n language to API language codes
  const currentLang = useMemo(() => {
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
  }, [i18n.language]);

  // Get address based on current language - only return if exists in current language
  const getAddress = useCallback((address: CompanyAddress): string | null => {
    const langKey = `address_${currentLang}` as keyof CompanyAddress;
    const addr = address[langKey] as string;
    
    // Only return address if it exists in current language, otherwise return null
    return addr && addr.trim() !== '' ? addr : null;
  }, [currentLang]);

  // Get title based on current language
  const getTitle = (address: CompanyAddress): string => {
    if (currentLang === 'kr') {
      return address.title_kr || address.title_uz;
    }
    return address.title_uz || address.title_kr;
  };

  // Get work time title based on current language
  const getWorkTimeTitle = (workTime: WorkTime): string => {
    const langKey = `title_${currentLang}` as keyof WorkTime;
    const title = workTime[langKey] as string;
    
    // Fallback to other languages if current language not available
    return title || workTime.title_uz || workTime.title_ru || workTime.title_en || '';
  };

  // Get phone title based on current language
  const getPhoneTitle = useCallback((phoneItem: { title_uz?: string; title_kr?: string; title_ru?: string; title_en?: string; title_kz?: string; title_kg?: string; title_tj?: string }): string => {
    const langKey = `title_${currentLang}` as keyof typeof phoneItem;
    const title = phoneItem[langKey] as string;
    
    // Fallback to other languages if current language not available
    return title || phoneItem.title_uz || phoneItem.title_kr || phoneItem.title_ru || phoneItem.title_en || '';
  }, [currentLang]);


  const contactItems: ContactItem[] = useMemo(
    () => {
      const emailValue = companyInfo?.email || companyEmail?.email || '';
      const phoneValue =
        companyInfo?.phone || (phoneNumbers.length > 0 ? phoneNumbers[0].phone : '');
      const whatsappValue = companyInfo?.whatsapp || '';
      
      return [
        {
          icon: <PhoneIcon />,
          label: t('common.phone'),
          value: phoneValue,
        },
        {
          icon: <WhatsAppIcon />,
          label: t('footer.whatsApp'),
          value: whatsappValue,
        },
        {
          icon: <EmailIcon />,
          label: t('common.email'),
          value: emailValue,
        },
      ];
    },
    [t, companyEmail, companyInfo, phoneNumbers]
  );

  // Get hover color for social media platform
  const getSocialHoverColor = useCallback((name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('whatsapp')) return 'hover:bg-[#25D366] hover:text-white';
    if (nameLower.includes('instagram')) return 'hover:bg-gradient-to-r hover:from-[#E4405F] hover:via-[#F56040] hover:to-[#FCAF45] hover:text-white';
    if (nameLower.includes('facebook')) return 'hover:bg-[#1877F2] hover:text-white';
    if (nameLower.includes('telegram')) return 'hover:bg-[#0088CC] hover:text-white';
    if (nameLower.includes('youtube')) return 'hover:bg-[#FF0000] hover:text-white';
    if (nameLower.includes('linkedin')) return 'hover:bg-[#0077B5] hover:text-white';
    if (nameLower.includes('tiktok')) return 'hover:bg-[#000000] hover:text-white';
    if (nameLower.includes('email')) return 'hover:bg-[#34A853] hover:text-white';
    return 'hover:bg-[#1857FE] hover:text-white';
  }, []);


  return (
    <>    
    {/* Social Links Section */}
    {!socialLinksLoading && socialLinks.length > 0 && (
        <div className="w-full max-w-full overflow-x-hidden my-6 md:my-8">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-none lg:flex lg:flex-row gap-3 sm:gap-4 md:gap-4 lg:gap-3 xl:gap-4">
              {socialLinks.map((link, index) => (
                <a
                  key={`${link.name}-${index}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center border border-gray-300 gap-2 sm:gap-2.5 md:gap-3 px-3 sm:px-4 md:px-4 lg:px-3 xl:px-4 py-2.5 sm:py-3 md:py-3 lg:py-2.5 xl:py-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200  focus:outline-none focus:ring-2 focus:ring-[#1857FE] focus:ring-offset-2 ${getSocialHoverColor(link.name)}`}
                  title={link.name}
                  aria-label={link.name}
                >
                  <div
                    className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-5 lg:h-5 xl:w-6 xl:h-6 flex items-center justify-center group-hover:[&_svg]:fill-white transition-colors duration-200"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(link.icon) }}
                  />
                  <span className="text-xs sm:text-sm md:text-sm lg:text-xs xl:text-sm font-medium text-gray-700 group-hover:text-white whitespace-nowrap transition-colors duration-200">
                    {link.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    <footer className="bg-[#E9EEFE] py-8  mt-10 md:py-12">  
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Left Column - Logo & Contact */}
          <div className="space-y-4 md:space-y-6">
            <div className="w-full max-w-[120px] md:max-w-[140px] lg:max-w-[160px] h-auto">
              <img
                src={LogoIcon}
                alt="Ko'z Nuri Logo"
                className="w-full h-auto object-contain"
              />
            </div>

            <button
              onClick={() => setIsAppointmentModalOpen(true)}
              className="bg-[#1857FE] text-white px-4 md:px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#0d47e8] transition-colors duration-200 font-medium shadow-lg w-full md:w-auto justify-center md:justify-start text-xs md:text-sm cursor-pointer"
            >
              <CalendarIcon />
              <span>{t('common.bookAppointment')}</span>
            </button>

            <div className="flex flex-row flex-wrap md:flex-col lg:flex-row lg:flex-wrap xl:flex-col gap-2 md:gap-2.5 lg:gap-2 xl:gap-3">
              {contactItems.map((item, idx) => (
                <ContactItem key={idx} {...item} />
              ))}
            </div>
          </div>

          {/* Middle Column - Menu */}
          <div className="space-y-6 md:space-y-8">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
                {t('footer.menu')}
              </h3>
              <nav className="space-y-2">
                {navigationLinks.map((link, idx) => (
                  <NavigationLink 
                    key={idx} 
                    link={link} 
                  />
                ))}
              </nav>
            </div>
          </div>

          {/* Phone Numbers Column */}
          {!phonesLoading && phoneNumbers.length > 0 && (() => {
            const filteredPhones = phoneNumbers.filter((phoneItem) => {
              const langKey = `title_${currentLang}` as keyof typeof phoneItem;
              const title = phoneItem[langKey] as string;
              return title && title.trim() !== '';
            });

            if (filteredPhones.length === 0) return null;

            return (
              <div className="space-y-6 md:space-y-8">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
                    {t('footer.phoneNumbers')}
                  </h3>
                  <div className="space-y-1.5 md:space-y-2">
                    {filteredPhones.map((phoneItem, idx) => {
                      const phoneTitle = getPhoneTitle(phoneItem);
                      if (!phoneTitle) return null;
                      
                      return (
                        <div key={idx} className="text-gray-700 text-sm md:text-base break-words">
                          <span className="font-medium">{phoneTitle}</span>
                          <br />
                          <span>{phoneItem.phone}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Right Column - Address & Working Hours */}
          <div className="space-y-6 md:space-y-8">
            {!addressesLoading && companyAddresses && companyAddresses.length > 0 && (
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
                  {t('footer.clinicAddresses')}
                </h3>
                <div className="space-y-3 md:space-y-4">
                  {companyAddresses
                    .filter((address) => {
                      const langKey = `address_${currentLang}` as keyof CompanyAddress;
                      const addr = address[langKey] as string;
                      return addr && addr.trim() !== '';
                    })
                    .slice(0, 3)
                    .map((address, idx) => {
                      const addressText = getAddress(address);
                      if (!addressText) return null;
                      
                      return (
                        <div key={idx} className="space-y-1 md:space-y-2">
                          <p className="text-gray-700 text-sm md:text-base font-medium">
                            {getTitle(address)}
                          </p>
                          <p className="text-gray-700 text-sm md:text-base">
                            {addressText}
                          </p>
                        </div>
                      );
                    })}
                  <div className="py-2 w-[60%] border-b border-dashed border-[#1857FE]">
                    <button
                      onClick={handleScrollToLocation}
                      className="text-sm md:text-base text-[#1857FE] transition-colors duration-200 hover:text-[#0d47e8] cursor-pointer"
                    >
                      {t('footer.viewOnMap')}
                    </button>
                  </div>
                </div>
              </div>
            )}
 {/* Working Hours Column */}
 {!workTimesLoading && workTimes && workTimes.length > 0 && (
            <div className="space-y-6 md:space-y-8">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
                {t('footer.workingHours')}
              </h3>
              <div className="space-y-2 md:space-y-3">
                {workTimes.map((workTime, idx) => (
                  <div key={idx} className="space-y-1 md:space-y-1.5">
                    <p className="text-gray-700 text-sm md:text-base font-medium">
                      {getWorkTimeTitle(workTime)}
                    </p>
                    <p className="text-gray-700 text-sm md:text-base">
                      {workTime.start_time} - {workTime.end_time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>

         
        </div>

          {/* Bottom Border */}
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
              <p className="text-xs md:text-sm text-gray-600 text-center md:text-left">
                {t('footer.copyright')}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Appointment Modal */}
      <AppointmentFormModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
      />
    </footer>
    </>
  );
};

export default Footer;