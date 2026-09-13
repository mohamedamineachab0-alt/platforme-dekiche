import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { assertStudentLessonAccess } from "@/lib/lesson-access";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isStemSubject(subject?: string | null): boolean {
  if (!subject) return false;
  const s = subject.trim().toLowerCase();
  return /رياضيات|math|فيزياء|كيمياء|physique|chimie|علوم الطبيعة|طبيعة و حياة|علوم طبيعية|snv|biologie|science|sciences/i.test(
    s
  );
}

function getSubjectLanguage(subject?: string | null): {
  label: string;
  code: "ar" | "fr" | "en" | "es" | "de" | "it";
} {
  if (!subject) return { label: "العربية (Arabic)", code: "ar" };
  const s = subject.trim().toLowerCase();
  if (/فرنسية|français|french|francais/i.test(s))
    return { label: "الفرنسية (French)", code: "fr" };
  if (/إنجليزية|english|anglais|انجليزية/i.test(s))
    return { label: "الإنجليزية (English)", code: "en" };
  if (/إسبانية|اسبانية|español|spanish/i.test(s))
    return { label: "الإسبانية (Spanish)", code: "es" };
  if (/ألمانية|المانية|allemand|deutsch|german/i.test(s))
    return { label: "الألمانية (German)", code: "de" };
  if (/إيطالية|ايطالية|italien|italian/i.test(s))
    return { label: "الإيطالية (Italian)", code: "it" };
  return { label: "العربية (Arabic)", code: "ar" };
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "مفتاح OpenAI مفقود في إعدادات الخادم (OPENAI_API_KEY)" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { lessonId, studentLevel, studentStream, mode, text } = body;

    if (!lessonId) {
      return NextResponse.json({ error: "معرّف الدرس مطلوب" }, { status: 400 });
    }

    const access = await assertStudentLessonAccess(lessonId);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const { lesson } = access;

    // Translate existing summary to Arabic
    if (mode === "translate") {
      const source = typeof text === "string" ? text.trim() : "";
      if (!source) {
        return NextResponse.json({ error: "نص التلخيص مطلوب للترجمة" }, { status: 400 });
      }

      const translateMessages = [
        {
          role: "system" as const,
          content: `أنت مترجم تربوي محترف للمنهاج الجزائري.
ترجم النص التالي إلى العربية الفصحى السليمة مع الحفاظ على:
- نفس الهيكل والنقاط
- صيغ LaTeX داخل $...$ كما هي دون تغيير
- المعنى العلمي/الأدبي بدقة
أرجع النص المترجم فقط دون مقدمة أو تعليقات.`,
        },
        {
          role: "user" as const,
          content: `عنوان الدرس: ${lesson.title}\nالمادة: ${lesson.subjectTitle}\n\nالنص للترجمة:\n${source}`,
        },
      ];

      let translated = "";
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.2,
          max_tokens: 2000,
          messages: translateMessages,
        });
        translated = response.choices[0]?.message?.content?.trim() || "";
      } catch (err: any) {
        console.warn("translate fallback:", err?.message);
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          temperature: 0.2,
          max_tokens: 2000,
          messages: translateMessages,
        });
        translated = response.choices[0]?.message?.content?.trim() || "";
      }

      if (!translated) {
        return NextResponse.json(
          { error: "تعذر ترجمة التلخيص، حاول مرة أخرى" },
          { status: 502 }
        );
      }

      return NextResponse.json({ summary: translated, language: "ar" });
    }

    const materialsList =
      lesson.materialTitles.length > 0
        ? lesson.materialTitles.join("، ")
        : "لا توجد ملحقات";

    const lang = getSubjectLanguage(lesson.subjectTitle);
    const isStem = isStemSubject(lesson.subjectTitle);

    const mathInstruction = isStem
      ? `المادة علمية/رياضية: اكتب المعادلات والصيغ بصيغة LaTeX داخل $...$ فقط (مثال: $f(x)=2x+1$).`
      : `المادة غير علمية: لا تستخدم معادلات LaTeX إلا عند الضرورة.`;

    const systemPrompt = `أنت أستاذ جزائري خبير في تلخيص الدروس وفق المنهاج الرسمي.
اكتب تلخيصاً دراسياً واضحاً لدرس واحد فقط.

لغة التلخيص إجبارية: ${lang.label} حصراً.
${mathInstruction}

هيكل التلخيص:
1. فكرة عامة قصيرة عن الدرس
2. أهم المفاهيم / النقاط الأساسية (قائمة نقطية)
3. قوانين أو قواعد مهمة إن وُجدت
4. نصائح مراجعة سريعة قبل الاختبار

القواعد:
- المستوى: ${studentLevel || "التعليم الثانوي"} — الشعبة: ${studentStream || "عام"}
- التزم بموضوع الدرس والمنهاج الجزائري فقط
- أسلوب واضح ومناسب للمراجعة على الهاتف
- لا تختلق معلومات خارج الدرس
- لا تستخدم عناوين Markdown كبيرة (#)؛ استخدم نصاً عادياً وقوائم نقطية`;

    const userPrompt = `الدرس: ${lesson.title}
المادة: ${lesson.subjectTitle}
لغة الإخراج: ${lang.label}
الشهر: ${lesson.month}
الوصف: ${lesson.description || "غير متوفر"}
الملحقات: ${materialsList}

اكتب تلخيص الدرس الآن.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ];

    let summary = "";
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.45,
        max_tokens: 1800,
        messages,
      });
      summary = response.choices[0]?.message?.content?.trim() || "";
    } catch (err: any) {
      console.warn("gpt-4o-mini summary fallback:", err?.message);
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.45,
        max_tokens: 1800,
        messages,
      });
      summary = response.choices[0]?.message?.content?.trim() || "";
    }

    if (!summary) {
      return NextResponse.json(
        { error: "تعذر إنشاء التلخيص، حاول مرة أخرى" },
        { status: 502 }
      );
    }

    return NextResponse.json({ summary, language: lang.code });
  } catch (error) {
    console.error("lesson-summary error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء تلخيص الدرس" },
      { status: 500 }
    );
  }
}
