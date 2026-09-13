"use client";

import { useState } from "react";
import { Reveal } from "@/components/landing/Reveal";

const FAQS = [
  {
    q: "كيف أفتح حساباً في منصة دقيش؟",
    a: "اضغط على «إنشاء حساب»، اختر حساب تلميذ أو وليّ أمر، أكمل اسمك وبياناتك، ثم فعّل موادك برموز الاشتراك.",
  },
  {
    q: "هل المحتوى مخصّص للثانية والثالثة ثانوي؟",
    a: "نعم. المنصة موجّهة لتلاميذ 2 و 3 ثانوي، وكل شعبة تجد فيها الدروس والتمارين الخاصة بها.",
  },
  {
    q: "ماذا أجد داخل كل درس؟",
    a: "شرح مصوّر، خريطة ذهنية، ملخص للمراجعة، وتمارين. ويمكنك سؤال المساعد داخل الدرس إذا احتجت توضيحاً.",
  },
  {
    q: "كيف يتابع وليّ الأمر ابنه؟",
    a: "الوليّ يفتح حساباً ويُربط بحساب الابن. يتابع التقدم، النقاط، وما يحتاج مراجعة.",
  },
];

export function LandingAskAI() {
  const [open, setOpen] = useState(0);

  return (
    <div className="mx-auto max-w-3xl">
      <Reveal>
        <p className="mb-3 text-center text-sm font-black text-[#6D28D9]">إجابات موجزة</p>
        <h2 className="text-center text-3xl font-black text-[#1E1B4B] sm:text-5xl">الأسئلة الشائعة</h2>
      </Reveal>
      <div className="mt-10 space-y-3">
        {FAQS.map((item, i) => {
          const active = open === i;
          return (
            <Reveal key={item.q} delay={i * 60}>
              <button
                type="button"
                onClick={() => setOpen(active ? -1 : i)}
                className="w-full rounded-[28px] bg-white p-5 text-right shadow-[0_10px_30px_rgba(30,27,75,0.05)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-black text-[#1E1B4B] sm:text-lg">{item.q}</h3>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3EFFF] text-sm font-black text-[#6D28D9]">
                    {active ? "−" : "+"}
                  </span>
                </div>
                {active ? <p className="mt-3 text-sm font-medium leading-relaxed text-[#6B6480]">{item.a}</p> : null}
              </button>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
