import { HUNDRED_TIPS } from "@/lib/hundredTips";
import { Lightbulb } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default function TipsPage() {
  return (
    <div className="space-y-8 pb-12 font-sans text-[#1E1B4B]" dir="rtl">
      <HeroBanner
        title="100 نصيحة ذهبية للتفوق الدراسي والامتحانات"
        description="مجموعة مختارة بعناية من أفضل النصائح لبناء شخصية دراسية قوية وإدارة وقتك بفعالية"
        icon={Lightbulb}
      />

      <div className="grid grid-cols-1 gap-5 pt-2 md:grid-cols-2 lg:grid-cols-3">
        {HUNDRED_TIPS.map((tip, index) => (
          <div
            key={index}
            className="group flex flex-col rounded-[28px] border border-[#EDE9FE] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#6D28D9]/40 hover:shadow-[0_12px_40px_rgba(109,40,217,0.12)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-[#6D28D9]/10 px-4 py-1.5 text-sm font-black text-[#1E1B4B]">
                نصيحة {index + 1}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF1FF] text-[#6D28D9] transition group-hover:bg-[#6D28D9] group-hover:text-white">
                <Lightbulb className="h-4 w-4" />
              </div>
            </div>

            <p className="flex-1 text-base font-bold leading-loose break-words text-[#1E1B4B]">
              {tip}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
