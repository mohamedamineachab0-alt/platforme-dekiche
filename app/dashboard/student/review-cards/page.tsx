"use client";

import { useEffect, useState } from "react";
import { Library } from "lucide-react";
import { fetchMyReviewCards } from "@/actions/review-cards";
import { FlipCard } from "@/components/student/FlipCard";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default function StudentReviewCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCards() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch from our Server Action which handles session and Prisma logic internally
        const fetchedCards = await fetchMyReviewCards();
        setCards(fetchedCards || []);
      } catch (err: any) {
        console.error("Error fetching cards:", err);
        setError(err.message || "حدث خطأ أثناء جلب بطاقات المراجعة");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCards();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12">
        <HeroBanner 
          title="بطاقات المراجعة"
          description="راجع دروسك بسرعة وفعالية باستخدام بطاقات الذاكرة التفاعلية المصممة لمستواك وشعبتك"
          icon={Library}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-[#6D28D9] flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#EDE9FE] border-t-sky-600 rounded-full animate-spin"></div>
            <p className="font-bold text-slate-600">جاري تحميل البطاقات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 pb-12">
        <HeroBanner 
          title="بطاقات المراجعة"
          description="راجع دروسك بسرعة وفعالية باستخدام بطاقات الذاكرة التفاعلية المصممة لمستواك وشعبتك"
          icon={Library}
        />
        <div className="p-8 text-center bg-amber-50 rounded-2xl border border-[#6D28D9]/20 max-w-2xl mx-auto mt-8 font-arabic" dir="rtl">
          <h3 className="font-bold text-amber-600 text-lg">{error}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <HeroBanner 
        title="بطاقات المراجعة"
        description="راجع دروسك بسرعة وفعالية باستخدام بطاقات الذاكرة التفاعلية المصممة لمستواك وشعبتك"
        icon={Library}
      />

      {cards.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-[#EDE9FE] bg-white p-8 text-center font-arabic" dir="rtl">
          <h3 className="text-lg font-black text-[#1E1B4B]">لا توجد بطاقات متاحة حاليا</h3>
          <p className="mt-2 text-sm font-medium text-[#6B6480]">
            ستظهر بطاقات المراجعة الخاصة بمستواك وشعبتك هنا قريبا
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <FlipCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
