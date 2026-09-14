"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "#offerings", label: "ماذا نوفر" },
  { href: "#features", label: "لماذا نحن" },
  { href: "#steps", label: "طريقة العمل" },
  { href: "#faq", label: "الأسئلة" },
];

const LANGUAGE_LINKS = [
  { href: "#features", label: "لماذا نحن" },
  { href: "#steps", label: "طريقة العمل" },
  { href: "/", label: "العودة للرئيسية" },
];

export function LandingNav({
  isAuthenticated,
  platform = "study",
}: {
  isAuthenticated: boolean;
  platform?: "study" | "languages" | "soroban" | "quran" | "islamic" | "courses";
}) {
  const [open, setOpen] = useState(false);
  const isLanguages = platform === "languages";
  const homeHref =
    platform === "languages"
      ? "/languages"
      : platform === "soroban"
        ? "/soroban"
        : platform === "quran"
          ? "/quran"
          : platform === "islamic"
            ? "/islamic"
            : platform === "courses"
              ? "/courses"
              : "/";
  const registerHref =
    platform === "languages"
      ? "/register?platform=languages"
      : platform === "soroban"
        ? "/register?platform=soroban"
        : platform === "quran"
          ? "/register?platform=quran"
          : platform === "islamic"
            ? "/register?platform=islamic"
            : platform === "courses"
              ? "/register?platform=courses"
              : "/register";
  const loginHref =
    platform === "languages"
      ? "/login?platform=languages"
      : platform === "soroban"
        ? "/login?platform=soroban"
        : platform === "quran"
          ? "/login?platform=quran"
          : platform === "islamic"
            ? "/login?platform=islamic"
            : platform === "courses"
              ? "/login?platform=courses"
              : "/login";
  const dashboardHref =
    platform === "languages"
      ? "/dashboard/student/subjects"
      : "/dashboard/student";
  const brand =
    platform === "languages"
      ? "تعلّم اللغات"
      : platform === "soroban"
        ? "السوروبان"
        : platform === "quran"
          ? "القرآن الكريم"
          : platform === "islamic"
            ? "إسلاميات"
            : platform === "courses"
              ? "دورات أخرى"
              : "منصة دقيش التعليمية";

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-[#EDE9FE] bg-[#FFFEF8]/95 px-3 py-2 shadow-[0_10px_40px_rgba(30,27,75,0.08)] backdrop-blur sm:px-4">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          {isLanguages ? (
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1.5 text-xs font-black text-[#6B6480] transition hover:bg-[#F3EFFF] hover:text-[#6D28D9] sm:text-sm"
              title="العودة للصفحة الرئيسية"
            >
              <BackIcon />
              <span className="hidden sm:inline">الرئيسية</span>
            </Link>
          ) : null}
          <Link href={homeHref} className="flex min-w-0 items-center gap-2 rounded-full px-2 py-1">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6D28D9] text-white">
              <CapIcon />
            </span>
            <span className="max-w-[9.5rem] truncate text-[13px] font-black leading-tight text-[#6D28D9] sm:max-w-none sm:text-base">
              {brand}
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {(platform === "languages" ? LANGUAGE_LINKS : platform === "study" ? LINKS : [{ href: "/", label: "منصة الدراسة" }]).map(
            (link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3 py-2 text-sm font-bold text-[#6B6480] transition hover:bg-[#F3EFFF] hover:text-[#6D28D9]"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="rounded-full px-3 py-2 text-sm font-bold text-[#6B6480] transition hover:bg-[#F3EFFF] hover:text-[#6D28D9]"
                >
                  {link.label}
                </Link>
              )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={loginHref}
            className="hidden items-center justify-center rounded-full bg-[#F3EFFF] px-4 py-2 text-sm font-black text-[#6D28D9] sm:inline-flex"
          >
            دخول
          </Link>
          <Link
            href={isAuthenticated ? dashboardHref : registerHref}
            className="inline-flex items-center justify-center rounded-full bg-[#6D28D9] px-4 py-2 text-sm font-black text-white"
          >
            {isAuthenticated ? "حسابك" : "إنشاء حساب"}
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F3EFFF] text-[#6D28D9] lg:hidden"
            aria-expanded={open}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="mx-auto mt-2 max-w-6xl rounded-[28px] border border-[#EDE9FE] bg-[#FFFEF8] p-3 shadow-[0_16px_40px_rgba(30,27,75,0.1)] lg:hidden">
          {(platform === "languages" ? LANGUAGE_LINKS : platform === "study" ? LINKS : [{ href: "/", label: "منصة الدراسة" }]).map(
            (link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="block rounded-2xl px-4 py-3 text-sm font-black text-[#1E1B4B]"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="block rounded-2xl px-4 py-3 text-sm font-black text-[#1E1B4B]"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              )
          )}
          <Link
            href={loginHref}
            className="mt-1 block rounded-2xl bg-[#F3EFFF] px-4 py-3 text-center text-sm font-black text-[#6D28D9] sm:hidden"
            onClick={() => setOpen(false)}
          >
            دخول
          </Link>
        </div>
      ) : null}
    </header>
  );
}

function CapIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M3 10.5L12 6l9 4.5-9 4.5L3 10.5z" fill="currentColor" />
      <path d="M7 12.5v4.2c0 .6 2.2 2.3 5 2.3s5-1.7 5-2.3v-4.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
