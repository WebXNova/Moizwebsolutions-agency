import { useId } from 'react';

/**
 * Official Instagram brand glyph with signature purple→pink→orange→yellow gradient.
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function InstagramIcon(props) {
  const gradId = useId().replace(/:/g, '');

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id={gradId} x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCAF45" />
          <stop offset="25%" stopColor="#F56040" />
          <stop offset="50%" stopColor="#E1306C" />
          <stop offset="75%" stopColor="#C13584" />
          <stop offset="100%" stopColor="#833AB4" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradId})`}
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z"
      />
    </svg>
  );
}

/**
 * Official Facebook brand “f” glyph in Facebook blue (#1877F2).
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true" {...props}>
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.859-5.978.75 0 1.584.043 2.363.126v3.34h-1.62c-1.27 0-1.52.606-1.52 1.505v1.587h3.07l-.287 3.667h-2.783v7.98H9.101Z" />
    </svg>
  );
}

/**
 * Official LinkedIn brand glyph in LinkedIn blue (#0A66C2).
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function MenuIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <path d="M4 8h16M4 16h16" strokeLinecap="round" />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <path d="m7 7 10 10M17 7 7 17" strokeLinecap="round" />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function PlayIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M9 6.5v11l9-5.5-9-5.5Z" />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function ChevronRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function ArrowRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function ArrowLeftIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <path d="M20 12H5m0 0 5.5-5.5M5 12l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true" {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function CopyIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 5.5A1.5 1.5 0 0 0 13.5 4H5.5A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15" strokeLinecap="round" />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.04 2.5A9.4 9.4 0 0 0 3.9 16.62L2.5 21.5l5.02-1.32a9.4 9.4 0 1 0 4.52-17.68Zm0 1.7a7.7 7.7 0 0 1 0 15.4 7.7 7.7 0 0 1-3.92-1.07l-.3-.18-2.94.77.79-2.86-.19-.31a7.7 7.7 0 0 1 6.56-11.75Zm-3.2 3.72c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.72 2.74 4.22 3.73 2.08.82 2.5.66 2.95.62.45-.04 1.46-.6 1.66-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29-.25-.13-1.46-.72-1.68-.8-.23-.09-.4-.13-.56.12-.17.25-.65.83-.8 1-.14.17-.29.19-.54.06-.25-.12-1.06-.39-2.02-1.25-.75-.66-1.25-1.48-1.4-1.73-.14-.25-.01-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.09-.16.04-.31-.02-.43-.06-.13-.56-1.34-.77-1.83-.16-.38-.32-.4-.48-.41h-.42Z" />
    </svg>
  );
}

/**
 * Indeterminate progress ring. The rotation is applied by the caller so it can
 * be wrapped in `motion-safe:` and stay still under reduced-motion settings.
 *
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function SpinnerIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function AlertIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.25" strokeLinecap="round" />
      <circle cx="12" cy="16.4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function ArrowUpRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function SunIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function MoonIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <path
        d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function MonitorIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M8 20h8M12 16v4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function VerifiedIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 1.25a6.75 6.75 0 1 0 0 13.5A6.75 6.75 0 0 0 8 1.25Zm3.03 4.72-3.6 3.6a.75.75 0 0 1-1.06 0l-1.8-1.8a.75.75 0 1 1 1.06-1.06l1.27 1.27 3.07-3.07a.75.75 0 1 1 1.06 1.06Z" />
    </svg>
  );
}

export function VideoIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <rect x="3" y="6" width="14" height="12" rx="1.5" />
      <path d="m17 10 4-2v8l-4-2" strokeLinejoin="round" />
    </svg>
  );
}

export function BrandIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <path d="M12 3 4 7v6c0 4.4 3.4 8.5 8 9 4.6-.5 8-4.6 8-9V7l-8-4Z" strokeLinejoin="round" />
      <path d="M9 12 11 14 15 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ThemeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="16" height="7" rx="1" />
    </svg>
  );
}

export function SparkIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function DashboardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

export function FolderIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-11Z" strokeLinejoin="round" />
    </svg>
  );
}

export function PlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export function TagIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <path d="M4 12.5V6.5A1.5 1.5 0 0 1 5.5 5H11.5L19 12.5 12.5 19 5 11.5V12.5Z" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SettingsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.4 18.4l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.4 5.6l1.42-1.42" strokeLinecap="round" />
    </svg>
  );
}

export function LogoutIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <path d="M10 17l-5-5 5-5M5 12h11M15 5h3.5A1.5 1.5 0 0 1 20 6.5v13a1.5 1.5 0 0 1-1.5 1.5H15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DiscoveryIcon(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.15" aria-hidden="true" {...props}>
      <circle cx="14" cy="14" r="7.25" />
      <path d="m19.4 19.4 6.1 6.1" strokeLinecap="round" />
    </svg>
  );
}

export function IterateIcon(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.15" aria-hidden="true" {...props}>
      <path d="M9.5 13.5A7.5 7.5 0 0 1 23 12.2" strokeLinecap="round" />
      <path d="M22.5 8.5 23 12.4l-3.8.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22.5 18.5A7.5 7.5 0 0 1 9 19.8" strokeLinecap="round" />
      <path d="M9.5 23.5 9 19.6l3.8-.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="2.1" />
    </svg>
  );
}

export function AgileIcon(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.15" aria-hidden="true" {...props}>
      <circle cx="16" cy="16" r="8.5" />
      <circle cx="16" cy="16" r="4.25" />
      <circle cx="16" cy="16" r="1.15" fill="currentColor" stroke="none" />
      <path d="M16 7.5V5.5M16 26.5v-2M24.5 16h2M5.5 16h2" strokeLinecap="round" />
    </svg>
  );
}

export function RocketIcon(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.15" aria-hidden="true" {...props}>
      <path d="M16 5c3.2 2.4 5.8 6.4 6.2 11.2 0 3.1-1.4 5.6-3.4 7.3h-5.6c-2-1.7-3.4-4.2-3.4-7.3C10.2 11.4 12.8 7.4 16 5Z" strokeLinejoin="round" />
      <circle cx="16" cy="13.2" r="1.7" />
      <path d="M12.2 21.4 9.4 26M19.8 21.4 22.6 26" strokeLinecap="round" />
      <path d="M13.6 23.6h4.8" strokeLinecap="round" />
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 5 5" strokeLinecap="round" />
    </svg>
  );
}

export function EditIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <path d="M5 19h3.75L18.5 7.25a1.5 1.5 0 0 0 0-2.12l-1.63-1.63a1.5 1.5 0 0 0-2.12 0L5 14.88V19Z" strokeLinejoin="round" />
    </svg>
  );
}

export function TrashIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <path d="M5 7h14M9 7V5.5A1 1 0 0 1 10 5h4a1 1 0 0 1 1 .5V7M10 11v5M14 11v5M7 7l.75 11.5A1.5 1.5 0 0 0 9.24 20h5.52a1.5 1.5 0 0 0 1.49-1.5L16 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EyeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export function DesignIcon(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" {...props}>
      <g className="origin-[16px_16px] motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-px motion-safe:group-hover:-rotate-6">
        <path d="M8 24 22.5 9.5l3 3L11 27H8v-3Z" strokeLinejoin="round" />
        <path d="m20.5 11.5 3 3" strokeLinecap="round" />
      </g>
      <path
        d="M7 8h9M7 13h6"
        strokeLinecap="round"
        className="origin-left motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:translate-x-0.5"
      />
    </svg>
  );
}

export function DevelopmentIcon(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" {...props}>
      <rect x="4.5" y="6.5" width="23" height="19" rx="1" />
      <path d="M5 11h22" strokeLinecap="round" />
      <path
        d="M10 17l-3 2.5 3 2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:-translate-x-0.5"
      />
      <path
        d="M22 17l3 2.5-3 2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:translate-x-0.5"
      />
      <path
        d="M18 15l-4 9"
        strokeLinecap="round"
        className="motion-safe:transition-opacity motion-safe:duration-500 motion-safe:group-hover:opacity-70"
      />
    </svg>
  );
}

export function GrowthIcon(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" {...props}>
      <path d="M6 25V14M13 25V9M20 25V17M27 25V5" strokeLinecap="round" />
      <path d="m6 10 7-4 7 7 7-11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MarketingIcon(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" {...props}>
      <path d="M6 25h20" strokeLinecap="round" />
      <path
        d="M9 21v-4M15 21V11M21 21V8M27 21V5"
        strokeLinecap="round"
        className="origin-[16px_21px] motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-y-110"
      />
      <path
        d="m8 14 7-5 6 4 7-8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="origin-center motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:rotate-2"
      />
    </svg>
  );
}

export function GraphicDesignIcon(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" {...props}>
      <path d="M7.5 24.5 20.2 8.6l3.4 3.1L10.8 27.6H7.5v-3.1Z" strokeLinejoin="round" />
      <path d="m19 10.4 3.1 2.8" strokeLinecap="round" />
      <path d="M8 8.5c3.8-3.2 8.8-.6 12.2 3.4" strokeLinecap="round" />
      <circle cx="8" cy="8.5" r="1.15" />
      <circle cx="20.2" cy="11.9" r="1.15" />
      <rect x="21.2" y="20.2" width="5.2" height="5.2" />
    </svg>
  );
}

export function BoltIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.6 2.35 6.55 13.05c-.2.3-.02.72.35.72h4.72l-1.4 7.2c-.11.56.61.9.96.45l7.55-10.5c.22-.31 0-.74-.37-.74h-4.82l1.55-6.92c.12-.54-.6-.88-.99-.41Z" />
    </svg>
  );
}

/** @type {Record<string, import('react').ComponentType<import('react').SVGProps<SVGSVGElement>>>} */
export const socialIconMap = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
};

export const serviceIconMap = {
  design: DesignIcon,
  development: DevelopmentIcon,
  marketing: MarketingIcon,
  graphic: GraphicDesignIcon,
  growth: GrowthIcon,
};

export const processIconMap = {
  discovery: DiscoveryIcon,
  iterate: IterateIcon,
  agile: AgileIcon,
  launch: RocketIcon,
};

export const icons = {
  menu: MenuIcon,
  close: CloseIcon,
  play: PlayIcon,
  chevronRight: ChevronRightIcon,
  arrowUpRight: ArrowUpRightIcon,
  design: DesignIcon,
  development: DevelopmentIcon,
  marketing: MarketingIcon,
  graphic: GraphicDesignIcon,
  growth: GrowthIcon,
};
