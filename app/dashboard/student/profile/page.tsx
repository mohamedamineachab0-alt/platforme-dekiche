import { UserCircle } from "lucide-react";
import { assertAuth } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { AvatarSelector } from "@/components/student/AvatarSelector";
import { LEVELS, STREAMS, getWilayaName } from "@/lib/constants";
import { UNDERSTANDING_LABELS } from "@/lib/student-level";

export default async function StudentProfilePage() {
  const sessionUser = await assertAuth({ requireRole: "STUDENT" });

  const user = await prisma.user
    .findUnique({
      where: { id: sessionUser.id },
      select: {
        fullName: true,
        phoneNumber: true,
        avatarUrl: true,
        studentProfile: true,
      },
    })
    .catch(() => null);

  if (!user || !user.studentProfile) redirect("/login");

  const profile = user.studentProfile;
  const levelLabel = LEVELS.find((l) => l.value === profile.level)?.label || profile.level;
  const streamLabel = STREAMS.find((s) => s.value === profile.stream)?.label || profile.stream;
  const storedLevel = profile.understandingLevel
    ? UNDERSTANDING_LABELS[profile.understandingLevel]
    : "ضعيف";

  return (
    <div className="mx-auto max-w-4xl space-y-8 font-sans text-[#1E1B4B]" dir="rtl">
      <HeroBanner
        title="ملفي الشخصي"
        description="بياناتك الدراسية، ومستوى الفهم الذي يعتمد عليه أستاذي الذكي."
        icon={UserCircle}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-[32px] border border-[#EDE9FE] bg-white p-6 shadow-[0_12px_36px_rgba(30,27,75,0.06)]">
          <h2 className="mb-5 text-lg font-black text-[#1E1B4B]">الصورة والاسم</h2>
          <AvatarSelector currentAvatarUrl={user.avatarUrl} />
        </div>

        <div className="rounded-[32px] border border-[#EDE9FE] bg-white p-6 shadow-[0_12px_36px_rgba(30,27,75,0.06)]">
          <h2 className="mb-5 text-lg font-black text-[#1E1B4B]">مستوى الفهم</h2>
          <div className="rounded-[24px] bg-red-50 px-5 py-4">
            <p className="text-xs font-bold text-red-600">يعتمد أستاذي الذكي هذا المستوى لكل التلاميذ</p>
            <p className="mt-1 text-2xl font-black text-red-700">ضعيف</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-red-800">
              الشرح مبسّط، والتمارين متدرجة، والتلميحات خطوة بخطوة حتى يثبت الفهم.
            </p>
          </div>
          <p className="mt-4 text-sm font-bold text-[#6B6480]">
            اختيارك عند التسجيل: {storedLevel}
          </p>
        </div>
      </div>

      <div className="rounded-[32px] border border-[#EDE9FE] bg-white p-6 shadow-[0_12px_36px_rgba(30,27,75,0.06)]">
        <h2 className="mb-4 text-lg font-black text-[#1E1B4B]">بيانات الحساب</h2>
        <div className="divide-y divide-[#EDE9FE]">
          {[
            ["الاسم الكامل", user.fullName],
            ["رقم الهاتف", user.phoneNumber],
            ["الولاية", getWilayaName(profile.wilaya)],
            ["المستوى", levelLabel],
            ["الشعبة", streamLabel],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-3">
              <span className="text-sm font-bold text-[#6B6480]">{label}</span>
              <span className="font-black text-[#1E1B4B]" dir={label === "رقم الهاتف" ? "ltr" : "rtl"}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[32px] border border-[#EDE9FE] bg-white p-6 shadow-[0_12px_36px_rgba(30,27,75,0.06)]">
        <h2 className="mb-3 text-lg font-black text-[#1E1B4B]">مظهر المنصة</h2>
        <p className="mb-4 text-sm font-medium text-[#6B6480]">بدّل بين الوضع الفاتح والوضع الداكن.</p>
        <ThemeToggle />
      </div>
    </div>
  );
}
