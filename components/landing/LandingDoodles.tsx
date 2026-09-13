"use client";

import { useLandingPointer } from "@/components/landing/LandingMotion";

export function LandingDoodles() {
  const { x, y } = useLandingPointer();
  const dx = (x - 0.5) * 40;
  const dy = (y - 0.5) * 30;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* stars & shapes */}
      <svg className="land-spin absolute top-20 left-[4%] h-24 w-24 opacity-40" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="30" stroke="#FFFFFF" strokeDasharray="5 8" strokeWidth="2" />
      </svg>
      <svg
        className="land-float absolute top-24 right-[8%] h-16 w-16"
        style={{ transform: `translate(${-dx * 0.6}px, ${dy * 0.5}px)` }}
        viewBox="0 0 64 64"
      >
        <path d="M32 6l6 18h18l-14 12 6 18-16-12-16 12 6-18L8 24h18z" fill="#A78BFA" opacity="0.85" />
      </svg>
      <svg
        className="land-float-slow absolute top-[38%] left-[3%] h-14 w-14"
        style={{ transform: `translate(${dx}px, ${-dy * 0.7}px)` }}
        viewBox="0 0 56 56"
      >
        <rect x="8" y="8" width="40" height="40" rx="12" fill="#FFFFFF" opacity="0.2" transform="rotate(18 28 28)" />
        <rect x="14" y="14" width="28" height="28" rx="8" fill="#A78BFA" opacity="0.7" transform="rotate(18 28 28)" />
      </svg>

      {/* book */}
      <svg
        className="land-float absolute top-[48%] right-[4%] h-20 w-20"
        style={{ transform: `translate(${-dx * 0.8}px, ${dy * 0.4}px)` }}
        viewBox="0 0 80 80"
      >
        <path d="M14 18h22c8 0 12 4 12 12v36c0-8-4-10-12-10H14V18z" fill="#DDD6FE" />
        <path d="M66 18H44c-8 0-12 4-12 12v36c0-8 4-10 12-10h22V18z" fill="#A78BFA" />
        <path d="M40 30v28" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" />
      </svg>

      {/* trophy */}
      <svg
        className="land-float-slow absolute top-[62%] left-[8%] h-16 w-16"
        style={{ transform: `translate(${dx * 0.5}px, ${dy}px)` }}
        viewBox="0 0 64 64"
      >
        <path d="M18 14h28v14c0 12-6 18-14 18s-14-6-14-18V14z" fill="#A78BFA" />
        <path d="M18 20c-8 2-10 8-8 14" fill="none" stroke="#FF8A65" strokeWidth="5" strokeLinecap="round" />
        <path d="M46 20c8 2 10 8 8 14" fill="none" stroke="#FF8A65" strokeWidth="5" strokeLinecap="round" />
        <rect x="26" y="44" width="12" height="6" rx="2" fill="#1E1B4B" />
        <rect x="20" y="50" width="24" height="6" rx="2" fill="#FFFFFF" opacity="0.9" />
      </svg>

      {/* pencil */}
      <svg
        className="land-float absolute top-[28%] left-[12%] h-12 w-12"
        style={{ transform: `translate(${dx * 0.9}px, ${dy * 0.3}px) rotate(-25deg)` }}
        viewBox="0 0 48 48"
      >
        <path d="M10 38l4-14 18-18 10 10-18 18-14 4z" fill="#A78BFA" />
        <path d="M32 6l10 10" stroke="#FF8A65" strokeWidth="4" strokeLinecap="round" />
        <path d="M10 38l4-4" fill="#1E1B4B" />
      </svg>

      {/* rocket / paper plane */}
      <svg
        className="land-float absolute top-[72%] right-[12%] h-14 w-14"
        style={{ transform: `translate(${-dx * 0.4}px, ${-dy * 0.5}px)` }}
        viewBox="0 0 56 56"
      >
        <path d="M10 36l30-24-8 28-6-10-16 6z" fill="#FFFFFF" opacity="0.9" />
        <path d="M40 12l6 4-10 8" fill="#A78BFA" />
      </svg>

      {/* target */}
      <svg
        className="land-spin absolute bottom-[28%] left-[42%] h-16 w-16 opacity-50"
        viewBox="0 0 64 64"
      >
        <circle cx="32" cy="32" r="24" fill="none" stroke="#FFFFFF" strokeWidth="3" />
        <circle cx="32" cy="32" r="14" fill="none" stroke="#A78BFA" strokeWidth="3" />
        <circle cx="32" cy="32" r="5" fill="#A78BFA" />
      </svg>

      {/* chat bubble */}
      <svg
        className="land-float-slow absolute top-[55%] left-[46%] h-12 w-12"
        style={{ transform: `translate(${dx * 0.3}px, ${dy * 0.6}px)` }}
        viewBox="0 0 48 48"
      >
        <rect x="6" y="8" width="36" height="24" rx="10" fill="#FFFFFF" opacity="0.85" />
        <path d="M16 32l6-6h10" fill="#FFFFFF" opacity="0.85" />
        <circle cx="18" cy="20" r="2.5" fill="#6D28D9" />
        <circle cx="24" cy="20" r="2.5" fill="#A78BFA" />
        <circle cx="30" cy="20" r="2.5" fill="#22C55E" />
      </svg>

      {/* math symbols */}
      <svg
        className="land-float absolute bottom-[12%] right-[6%] h-14 w-14"
        style={{ transform: `translate(${-dx}px, ${dy * 0.2}px)` }}
        viewBox="0 0 56 56"
      >
        <circle cx="28" cy="28" r="22" fill="#8B5CF6" opacity="0.9" />
        <path d="M18 28h20M28 18v20" stroke="#A78BFA" strokeWidth="5" strokeLinecap="round" />
      </svg>

      {/* small student head */}
      <svg
        className="land-float absolute top-[18%] left-[40%] h-16 w-16"
        style={{ transform: `translate(${dx * 0.2}px, ${dy * 0.8}px)` }}
        viewBox="0 0 64 64"
      >
        <circle cx="32" cy="26" r="14" fill="#FFD7B3" />
        <path d="M18 24c6-14 24-14 28 2" fill="#1E1B4B" />
        <circle cx="27" cy="26" r="2.5" fill="#1E1B4B" />
        <circle cx="37" cy="26" r="2.5" fill="#1E1B4B" />
        <path d="M27 32c3 3 7 3 10 0" fill="none" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" />
        <rect x="18" y="42" width="28" height="16" rx="8" fill="#A78BFA" />
      </svg>

      {/* phone */}
      <svg
        className="land-float-slow absolute bottom-[8%] left-[18%] h-16 w-16"
        style={{ transform: `translate(${dx * 0.7}px, ${-dy * 0.3}px)` }}
        viewBox="0 0 48 64"
      >
        <rect x="10" y="4" width="28" height="56" rx="8" fill="#FFFFFF" opacity="0.9" />
        <rect x="14" y="12" width="20" height="36" rx="4" fill="#6D28D9" />
        <circle cx="24" cy="54" r="3" fill="#A78BFA" />
      </svg>

      {/* sparkles */}
      <svg className="absolute top-[34%] right-[22%] h-8 w-8 land-float" viewBox="0 0 32 32">
        <path d="M16 2l2 10 10 2-10 2-2 10-2-10-10-2 10-2z" fill="#FFFFFF" opacity="0.7" />
      </svg>
      <svg className="absolute bottom-[40%] right-[30%] h-6 w-6 land-float-slow" viewBox="0 0 24 24">
        <path d="M12 2l1.5 7 7 1.5-7 1.5L12 20l-1.5-8-7-1.5 7-1.5z" fill="#A78BFA" opacity="0.8" />
      </svg>
      <svg className="absolute top-[78%] left-[28%] h-7 w-7 land-float" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="10" fill="#FF8A65" opacity="0.55" />
      </svg>
    </div>
  );
}
