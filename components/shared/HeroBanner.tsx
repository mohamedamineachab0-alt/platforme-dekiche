import React from "react";

export function HeroBanner({
  title,
  description,
  action,
  icon: Icon,
  iconSlot,
  gradientClass = "academy-hero-grid",
  showGridPattern = true,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
  iconSlot?: React.ReactNode;
  gradientClass?: string;
  showGridPattern?: boolean;
}) {
  return (
    <div className={`${gradientClass} relative overflow-hidden rounded-[32px] p-5 text-white sm:p-6 md:p-8`}>
      {showGridPattern && !gradientClass.includes("academy-hero-grid") && (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
      )}
      <div className="relative z-10 flex w-full flex-col items-center gap-4 text-white sm:flex-row sm:gap-5">
        {(iconSlot || Icon) && (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white sm:h-16 sm:w-16">
            {iconSlot ?? (Icon ? <Icon className="h-7 w-7 text-[#6D28D9] sm:h-8 sm:w-8" /> : null)}
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-1 text-center sm:text-right">
          <h2 className="text-lg font-black leading-tight sm:text-xl md:text-2xl">{title}</h2>
          <p className="text-sm font-medium text-white/80 md:text-base">{description}</p>
        </div>

        {action && <div className="flex w-full shrink-0 justify-center sm:w-auto">{action}</div>}
      </div>
    </div>
  );
}
