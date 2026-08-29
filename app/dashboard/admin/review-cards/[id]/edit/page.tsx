import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditReviewCardClient } from "@/components/admin/EditReviewCardClient";
import { Library } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function EditReviewCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const card = await prisma.reviewCard.findUnique({
    where: { id }
  });

  if (!card) notFound();

  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true, level: true, stream: true }
  });

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="تعديل بطاقة المراجعة"
        description="قم بتحديث معلومات بطاقة المراجعة"
        icon={Library}
        gradientClass="bg-gradient-to-r from-slate-900 to-emerald-600"
      />

      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <EditReviewCardClient card={card} subjects={subjects} />
      </div>
    </div>
  );
}
