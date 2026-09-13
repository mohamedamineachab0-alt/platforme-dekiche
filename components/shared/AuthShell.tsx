import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export function AuthShell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      dir="rtl"
      className="academy-page-grid relative flex min-h-dvh items-center justify-center px-4 py-8 font-sans text-[#1E1B4B] selection:bg-[#DDD6FE] selection:text-[#1E1B4B] sm:py-12"
    >
      <div className="absolute left-4 top-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#6D28D9]">
          <ThemeToggle compact />
        </span>
      </div>
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-xl"}`}>
        <div className="rounded-[32px] bg-white p-6 shadow-[0_16px_40px_rgba(30,27,75,0.06)] sm:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
