/**
 * OxiCloud Custom Icon Set
 * Apple-inspired minimal geometric icons
 * Consistent 1.5px stroke, 24×24 viewBox
 * NO Lucide or third-party icons
 */

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

// ─── Navigation ───────────────────────────────────────────

export const ArrowRight = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowUpRight = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowDown = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 5V19M12 19L6 13M12 19L18 13" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronDown = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronRight = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Actions ──────────────────────────────────────────────

export const Menu = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 7H20M4 12H16M4 17H20" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const Close = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const Plus = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const Search = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M16 16L21 21" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const ExternalLink = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 13V19C18 19.5523 17.5523 20 17 20H5C4.44772 20 4 19.5523 4 19V7C4 6.44772 4.44772 6 5 6H11" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 3H21V9" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 14L21 3" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

// ─── Objects ──────────────────────────────────────────────

export const Globe = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M3 12H21" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M12 3C14.5 5.5 15.5 8.5 15.5 12C15.5 15.5 14.5 18.5 12 21" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M12 3C9.5 5.5 8.5 8.5 8.5 12C8.5 15.5 9.5 18.5 12 21" stroke="currentColor" strokeWidth={strokeWidth} />
  </svg>
);

export const Document = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 3H14L19 8V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V4C5 3.44772 5.44772 3 6 3Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    <path d="M14 3V8H19" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
  </svg>
);

export const FileCheck = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 3H14L19 8V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V4C5 3.44772 5.44772 3 6 3Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    <path d="M14 3V8H19" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    <path d="M9 14L11 16L15 12" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Shield = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3L4 7V12C4 16.4183 7.58172 20 12 21C16.4183 20 20 16.4183 20 12V7L12 3Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
  </svg>
);

export const CheckCircle = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Check = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 12L10 17L19 7" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Clock = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Bell = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 8C18 4.68629 15.3137 2 12 2C8.68629 2 6 4.68629 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── People & Places ──────────────────────────────────────

export const User = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M5 20C5 17.2386 8.13401 15 12 15C15.866 15 19 17.2386 19 20" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const Users = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M2 19C2 16.7909 5.13401 15 9 15C12.866 15 16 16.7909 16 19" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx="17" cy="8" r="2.5" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M18 15C20.2091 15.5 22 16.7909 22 19" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const Building = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="3" width="16" height="18" rx="1" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M9 7H11M13 7H15M9 11H11M13 11H15M9 15H11M13 15H15" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M10 21V18H14V21" stroke="currentColor" strokeWidth={strokeWidth} />
  </svg>
);

export const MapPin = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 21C12 21 19 15.5 19 10C19 6.13401 15.866 3 12 3C8.13401 3 5 6.13401 5 10C5 15.5 12 21 12 21Z" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth={strokeWidth} />
  </svg>
);

export const Mail = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="5" width="18" height="14" rx="1" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M3 5L12 13L21 5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
  </svg>
);

// ─── System ───────────────────────────────────────────────

export const Sun = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const Moon = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Settings = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth={strokeWidth} />
  </svg>
);

export const Home = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    <path d="M9 21V14H15V21" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
  </svg>
);

export const Folder = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6C3 5.44772 3.44772 5 4 5H9L11 8H20C20.5523 8 21 8.44772 21 9V18C21 18.5523 20.5523 19 20 19H4C3.44772 19 3 18.5523 3 18V6Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
  </svg>
);

export const Spark = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
  </svg>
);

export const Chart = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 20H20" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M7 16V10" stroke="currentColor" strokeWidth={strokeWidth + 1} strokeLinecap="round" />
    <path d="M12 16V6" stroke="currentColor" strokeWidth={strokeWidth + 1} strokeLinecap="round" />
    <path d="M17 16V12" stroke="currentColor" strokeWidth={strokeWidth + 1} strokeLinecap="round" />
  </svg>
);

export const Logout = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44772 3 5 3H9" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Concepts (for website) ───────────────────────────────

export const Target = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export const Scale = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3V21" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M5 7L12 5L19 7" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 13C3 13 4 10 5 7" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M7 13C7 13 6 10 5 7" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M3 13C3 14.6569 3.89543 16 5 16C6.10457 16 7 14.6569 7 13" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M17 13C17 13 18 10 19 7" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M21 13C21 13 20 10 19 7" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M17 13C17 14.6569 17.8954 16 19 16C20.1046 16 21 14.6569 21 13" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M8 21H16" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const Eye = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={strokeWidth} />
  </svg>
);

export const Leaf = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 21C6 21 7 14 12 9C17 4 21 3 21 3C21 3 20 10 15 15C10 20 3 21 3 21" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 21L10 14" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const Wallet = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M2 10H22" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="17" cy="15" r="1" fill="currentColor" />
  </svg>
);

export const Euro = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M17 5C15.5 3.5 13.5 3 12 3C8.13401 3 5 6.13401 5 10V14C5 17.866 8.13401 21 12 21C13.5 21 15.5 20.5 17 19" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M4 10H13M4 14H11" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const Handshake = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M2 12L7 7L10 10L14 6L17 9L22 4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 12L7 17L12 12L16 16L22 10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Map = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6L9 3L15 6L21 3V18L15 21L9 18L3 21V6Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    <path d="M9 3V18M15 6V21" stroke="currentColor" strokeWidth={strokeWidth} />
  </svg>
);

export const Info = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M12 16V12" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx="12" cy="8" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
  </svg>
);

export const Copy = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="9" y="9" width="12" height="12" rx="1" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M5 15H4C3.44772 15 3 14.5523 3 14V4C3 3.44772 3.44772 3 4 3H14C14.5523 3 15 3.44772 15 4V5" stroke="currentColor" strokeWidth={strokeWidth} />
  </svg>
);

export const Trash = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6H21" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M5 6L6 20C6 20.5523 6.44772 21 7 21H17C17.5523 21 18 20.5523 18 20L19 6" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M10 10V17M14 10V17" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const Edit = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M16.474 5.408L18.592 7.526M17.836 3.472L3.828 17.48L3 21L6.52 20.172L20.528 6.164C20.889 5.803 21.091 5.313 21.091 4.818C21.091 4.323 20.889 3.833 20.528 3.472C20.167 3.111 19.677 2.909 19.182 2.909C18.687 2.909 18.197 3.111 17.836 3.472Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Filter = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 4H21L14 12.5V18L10 20V12.5L3 4Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
  </svg>
);

export const Download = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3V15M12 15L7 10M12 15L17 10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 17V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V17" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const Upload = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 15V3M12 3L7 8M12 3L17 8" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 17V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V17" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const Calendar = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="4" width="18" height="17" rx="1" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M3 9H21" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M8 2V5M16 2V5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const AlertCircle = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M12 8V12" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
  </svg>
);

export const Pause = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 5V19M16 5V19" stroke="currentColor" strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />
  </svg>
);

export const Play = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 4L20 12L6 20V4Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
  </svg>
);

export const Refresh = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M1 4V10H7" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M23 20V14H17" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Package = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    <path d="M12 12L21 7M12 12V22M12 12L3 7" stroke="currentColor" strokeWidth={strokeWidth} />
  </svg>
);

export const TrendingUp = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M22 7L13.5 15.5L8.5 10.5L2 17" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 7H22V13" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const HelpCircle = ({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
  </svg>
);
