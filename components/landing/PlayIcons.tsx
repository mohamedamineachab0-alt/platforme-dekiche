type IconSize = "xs" | "sm" | "md" | "lg";

const SIZE = {
  xs: "h-7 w-7",
  sm: "h-10 w-10",
  md: "h-[72px] w-[72px]",
  lg: "h-28 w-28",
} as const;

export function IconTeacher({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <path d="M10 34L40 18l30 16-30 16L10 34z" fill="#6D28D9" />
      <path d="M40 18l30 16v4L40 54 10 38v-4L40 18z" fill="#A78BFA" />
      <path d="M24 42v12c0 7 7 12 16 12s16-5 16-12V42" fill="none" stroke="#8B5CF6" strokeWidth="5" strokeLinecap="round" />
      <rect x="64" y="36" width="5" height="20" rx="2.5" fill="#FF8A65" />
      <circle cx="66.5" cy="58" r="4.5" fill="#FF8A65" />
    </svg>
  );
}

export function IconHome({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <path d="M14 36L40 14l26 22v30c0 4-3 8-8 8H22c-5 0-8-4-8-8V36z" fill="#6D28D9" />
      <rect x="32" y="44" width="16" height="22" rx="4" fill="#A78BFA" />
      <path d="M40 14l26 22h-8L40 22 22 36h-8L40 14z" fill="#A78BFA" />
    </svg>
  );
}

export function IconLessons({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <rect x="8" y="18" width="64" height="44" rx="12" fill="#6D28D9" />
      <rect x="14" y="24" width="52" height="32" rx="8" fill="#A78BFA" />
      <circle cx="40" cy="40" r="11" fill="#A78BFA" />
      <path d="M37 34.5v11l10-5.5-10-5.5z" fill="#1E1B4B" />
      <rect x="28" y="64" width="24" height="6" rx="3" fill="#FF8A65" />
    </svg>
  );
}

export function IconQuiz({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <rect x="18" y="12" width="44" height="56" rx="10" fill="#FFFFFF" />
      <rect x="22" y="16" width="36" height="48" rx="8" fill="#EEF1FF" />
      <rect x="28" y="26" width="24" height="5" rx="2.5" fill="#6D28D9" />
      <rect x="28" y="36" width="18" height="5" rx="2.5" fill="#A78BFA" />
      <circle cx="54" cy="54" r="14" fill="#22C55E" />
      <path d="M48 54.5l4 4 8-9" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMapPin({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <path d="M14 26l18-10 16 8 18-8v38l-18 10-16-8-18 10V26z" fill="#8B5CF6" />
      <path d="M32 16v38l16 8V24L32 16z" fill="#C4B5FD" />
      <path d="M16 52l16-8 16 8 16-8" fill="none" stroke="#5B21B6" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 50s-11-11-11-18a11 11 0 1122 0c0 7-11 18-11 18z" fill="#A78BFA" />
      <circle cx="40" cy="32" r="5" fill="#1E1B4B" />
    </svg>
  );
}

export function IconCode({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <circle cx="40" cy="28" r="12" fill="#FFD7B3" />
      <path d="M28 28c4-12 20-12 24 0" fill="#1E1B4B" />
      <circle cx="36" cy="27" r="2" fill="#1E1B4B" />
      <circle cx="44" cy="27" r="2" fill="#1E1B4B" />
      <path d="M36 32c3 3 5 3 8 0" fill="none" stroke="#1E1B4B" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="24" y="40" width="32" height="22" rx="10" fill="#A78BFA" />
      <rect x="46" y="46" width="22" height="16" rx="5" fill="#FFFFFF" />
      <path d="M52 52h10M52 57h7" stroke="#6D28D9" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconMath({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <rect x="8" y="14" width="64" height="52" rx="14" fill="#FFFFFF" />
      <rect x="14" y="20" width="52" height="40" rx="10" fill="#6D28D9" />
      <path d="M22 50l10-22 10 22z" fill="#A78BFA" />
      <circle cx="54" cy="34" r="8" fill="#FFFFFF" />
      <path d="M50 34h8M54 30v8" stroke="#6D28D9" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M44 52c6-10 12-10 18 0" fill="none" stroke="#FF8A65" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function IconCamera({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <rect x="10" y="26" width="60" height="38" rx="12" fill="#6D28D9" />
      <path d="M28 26l6-10h12l6 10" fill="#A78BFA" />
      <circle cx="42" cy="45" r="13" fill="#1E1B4B" />
      <circle cx="42" cy="45" r="8" fill="#A78BFA" />
      <circle cx="42" cy="45" r="3.5" fill="#A78BFA" />
      <rect x="54" y="32" width="10" height="6" rx="2" fill="#A78BFA" />
    </svg>
  );
}

export function IconCards({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <rect x="18" y="22" width="36" height="48" rx="10" fill="#DDD6FE" transform="rotate(-8 36 46)" />
      <rect x="26" y="14" width="36" height="48" rx="10" fill="#FFFFFF" />
      <rect x="32" y="22" width="24" height="6" rx="3" fill="#6D28D9" />
      <rect x="32" y="34" width="18" height="5" rx="2.5" fill="#A78BFA" />
      <circle cx="50" cy="52" r="10" fill="#A78BFA" />
    </svg>
  );
}

export function IconExam({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <rect x="16" y="12" width="48" height="56" rx="10" fill="#FFFFFF" />
      <rect x="24" y="24" width="32" height="5" rx="2.5" fill="#6D28D9" />
      <rect x="24" y="34" width="24" height="5" rx="2.5" fill="#A78BFA" />
      <rect x="24" y="44" width="28" height="5" rx="2.5" fill="#EDE9FE" />
      <circle cx="56" cy="58" r="14" fill="#A78BFA" />
      <path d="M51 58h10M56 53v10" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function IconBot({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <rect x="18" y="24" width="44" height="40" rx="14" fill="#6D28D9" />
      <rect x="36" y="12" width="8" height="14" rx="4" fill="#A78BFA" />
      <circle cx="40" cy="14" r="5" fill="#A78BFA" />
      <circle cx="32" cy="42" r="5" fill="#FFFFFF" />
      <circle cx="48" cy="42" r="5" fill="#FFFFFF" />
      <rect x="30" y="52" width="20" height="5" rx="2.5" fill="#A78BFA" />
    </svg>
  );
}

export function IconMistakes({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <circle cx="40" cy="40" r="28" fill="#FF8A65" />
      <path d="M40 22v24" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
      <circle cx="40" cy="56" r="4" fill="#FFFFFF" />
    </svg>
  );
}

export function IconLive({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <rect x="10" y="22" width="44" height="36" rx="10" fill="#6D28D9" />
      <path d="M54 32l16-8v32l-16-8V32z" fill="#A78BFA" />
      <circle cx="28" cy="40" r="8" fill="#FFFFFF" />
      <circle cx="28" cy="40" r="4" fill="#FF8A65" />
    </svg>
  );
}

export function IconTrophy({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <path d="M24 20h32v18c0 14-8 22-16 22s-16-8-16-22V20z" fill="#A78BFA" />
      <path d="M24 26c-10 2-14 10-10 18" fill="none" stroke="#FF8A65" strokeWidth="6" strokeLinecap="round" />
      <path d="M56 26c10 2 14 10 10 18" fill="none" stroke="#FF8A65" strokeWidth="6" strokeLinecap="round" />
      <rect x="32" y="58" width="16" height="8" rx="3" fill="#1E1B4B" />
      <rect x="26" y="64" width="28" height="8" rx="3" fill="#FFFFFF" />
    </svg>
  );
}

export function IconChallenge({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <circle cx="28" cy="40" r="16" fill="#8B5CF6" />
      <circle cx="52" cy="40" r="16" fill="#A78BFA" />
      <path d="M34 34l12 12M46 34L34 46" stroke="#1E1B4B" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function IconChat({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <rect x="12" y="16" width="56" height="40" rx="14" fill="#FFFFFF" />
      <path d="M28 56l8-8h20" fill="#FFFFFF" />
      <circle cx="30" cy="36" r="4" fill="#6D28D9" />
      <circle cx="40" cy="36" r="4" fill="#A78BFA" />
      <circle cx="50" cy="36" r="4" fill="#22C55E" />
    </svg>
  );
}

export function IconBell({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <path d="M26 34c0-10 6-18 14-18s14 8 14 18v10l8 10H18l8-10V34z" fill="#A78BFA" />
      <rect x="34" y="12" width="12" height="10" rx="6" fill="#1E1B4B" />
      <ellipse cx="40" cy="58" rx="10" ry="6" fill="#FF8A65" />
    </svg>
  );
}

export function IconTips({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <circle cx="40" cy="34" r="20" fill="#A78BFA" />
      <rect x="32" y="52" width="16" height="10" rx="4" fill="#FFFFFF" />
      <rect x="34" y="60" width="12" height="8" rx="3" fill="#1E1B4B" />
      <path d="M40 20v8M28 28l6 4M52 28l-6 4" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function IconSubscribe({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <rect x="12" y="22" width="56" height="36" rx="10" fill="#A78BFA" />
      <rect x="12" y="22" width="56" height="12" rx="10" fill="#6D28D9" />
      <rect x="22" y="42" width="22" height="6" rx="3" fill="#1E1B4B" />
      <circle cx="54" cy="45" r="6" fill="#FFFFFF" />
    </svg>
  );
}

export function IconLanguages({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <path d="M12 22c8-4 16-4 24 0v42c-8-4-16-4-24 0V22z" fill="#6D28D9" />
      <path d="M44 22c8-4 16-4 24 0v42c-8-4-16-4-24 0V22z" fill="#A78BFA" />
      <path d="M28 34h8M32 34v16" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M52 36c4 0 8 3 8 8s-4 8-8 8" fill="none" stroke="#6D28D9" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="52" cy="44" r="3" fill="#FF8A65" />
    </svg>
  );
}

export function IconSoroban({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <rect x="10" y="16" width="60" height="48" rx="12" fill="#6D28D9" />
      <rect x="16" y="34" width="48" height="6" rx="3" fill="#A78BFA" />
      <circle cx="26" cy="26" r="5" fill="#FFFFFF" />
      <circle cx="40" cy="26" r="5" fill="#FF8A65" />
      <circle cx="54" cy="26" r="5" fill="#FFFFFF" />
      <circle cx="26" cy="54" r="5" fill="#A78BFA" />
      <circle cx="40" cy="54" r="5" fill="#FFFFFF" />
      <circle cx="54" cy="54" r="5" fill="#A78BFA" />
    </svg>
  );
}

export function IconQuran({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <path d="M40 26c-9-7-20-9-30-7v36c10-2 21 0 30 7V26z" fill="#6D28D9" />
      <path d="M40 26c9-7 20-9 30-7v36c-10-2-21 0-30 7V26z" fill="#A78BFA" />
      <rect x="38" y="22" width="4" height="42" rx="2" fill="#1E1B4B" />
      <path d="M18 34h14M18 42h14M48 34h14M48 42h14" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
      <path d="M56 8a9 9 0 109 9 7 7 0 01-9-9z" fill="#FF8A65" />
    </svg>
  );
}

export function IconIslamic({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <path d="M14 66V44c0-14 11-26 26-26s26 12 26 26v22H14z" fill="#6D28D9" />
      <path d="M40 18a12 12 0 0112 12c0 5-3 9-7 11v9H35v-9c-4-2-7-6-7-11a12 12 0 0112-12z" fill="#A78BFA" />
      <rect x="37" y="8" width="6" height="10" rx="3" fill="#A78BFA" />
      <path d="M24 66V50a8 8 0 0116 0v16M40 66V50a8 8 0 0116 0v16" fill="none" stroke="#FFFFFF" strokeWidth="2.6" opacity="0.85" />
      <rect x="10" y="62" width="60" height="8" rx="4" fill="#1E1B4B" />
    </svg>
  );
}

export function IconCourses({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <rect x="10" y="12" width="28" height="26" rx="8" fill="#6D28D9" />
      <rect x="42" y="12" width="28" height="26" rx="8" fill="#A78BFA" />
      <rect x="10" y="42" width="28" height="26" rx="8" fill="#FF8A65" />
      <rect x="42" y="42" width="28" height="26" rx="8" fill="#FFFFFF" />
      <path d="M18 25h12M50 25h12M18 55h12" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <circle cx="56" cy="55" r="5" fill="#6D28D9" />
    </svg>
  );
}

export function IconSettings({ size = "md" }: { size?: IconSize }) {
  return (
    <svg viewBox="0 0 80 80" className={SIZE[size]} aria-hidden>
      <circle cx="40" cy="40" r="14" fill="#A78BFA" />
      <circle cx="40" cy="40" r="6" fill="#1E1B4B" />
      <path
        d="M40 12v8M40 60v8M12 40h8M60 40h8M20 20l6 6M54 54l6 6M20 60l6-6M54 26l6-6"
        stroke="#6D28D9"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
