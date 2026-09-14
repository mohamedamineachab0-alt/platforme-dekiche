import { assertAuth } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { HUNDRED_TIPS } from "@/lib/hundredTips";
import { LANGUAGE_HUNDRED_TIPS } from "@/lib/languageHundredTips";
import { Lightbulb } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { redirect } from "next/navigation";

export default async function TipsPage() {
  const session = await assertAuth({ requireRole: "STUDENT" });
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.id },
    select: { branch: true },
  });

  if (!profile) redirect("/login");

  const isLanguages = profile.branch === "LANGUAGES";
  const tips = isLanguages ? LANGUAGE_HUNDRED_TIPS : HUNDRED_TIPS;

  return (
    <div className="space-y-8 pb-12 font-sans text-[#1E1B4B]" dir="rtl">
      <HeroBanner
        title={
          isLanguages
            ? "100 نصيحة لتعلّم اللغات"
            : "100 نصيحة ذهبية للتفوق الدراسي والامتحانات"
        }
        description={
          isLanguages
            ? "نصائح عملية للاستماع والنطق والمفردات والممارسة اليومية حتى مستوى A1 وما بعده"
            : "مجموعة مختارة بعناية من أفضل النصائح لبناء شخصية دراسية قوية وإدارة وقتك بفعالية"
        }
        icon={Lightbulb}
      />

      <div className="grid grid-cols-1 gap-5 pt-2 md:grid-cols-2 lg:grid-cols-3">
        {tips.map((tip, index) => (
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
