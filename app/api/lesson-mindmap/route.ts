import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { assertStudentLessonAccess } from "@/lib/lesson-access";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export type MindMapNode = {
  title: string;
  children?: MindMapNode[];
};

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

function sanitizeNode(raw: unknown, depth = 0): MindMapNode | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const title = typeof obj.title === "string" ? obj.title.trim() : "";
  if (!title) return null;

  const childrenRaw = Array.isArray(obj.children) ? obj.children : [];
  const children =
    depth < 2
      ? childrenRaw
          .map((c) => sanitizeNode(c, depth + 1))
          .filter((c): c is MindMapNode => !!c)
          .slice(0, 8)
      : [];

  return children.length > 0 ? { title, children } : { title };
}

function extractTree(content: string): MindMapNode | null {
  const trimmed = content.trim();
  let parsed: unknown = null;

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        parsed = JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        return null;
      }
    }
  }

  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;

  if (obj.tree) return sanitizeNode(obj.tree);
  return sanitizeNode(parsed);
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
    const { lessonId, studentLevel, studentStream } = body;

    if (!lessonId) {
      return NextResponse.json({ error: "معرّف الدرس مطلوب" }, { status: 400 });
    }

    const access = await assertStudentLessonAccess(lessonId);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const { lesson } = access;
    const materialsList =
      lesson.materialTitles.length > 0
        ? lesson.materialTitles.join("، ")
        : "لا توجد ملحقات";

    const lang = getSubjectLanguage(lesson.subjectTitle);
    const isStem = isStemSubject(lesson.subjectTitle);

    const mathInstruction = isStem
      ? `المادة علمية/رياضية: اكتب كل المعادلات والصيغ والرموز بصيغة LaTeX داخل $...$ فقط (مثال: $f(x)=2x+1$ أو $E=mc^2$). لا تستخدم \\( \\) أو \\[ \\].`
      : `المادة غير علمية: لا تستخدم معادلات LaTeX إلا إذا ورد رمز ضروري نادراً.`;

    const systemPrompt = `أنت خبير بيداغوجي في المنهاج الجزائري.
أنشئ خريطة ذهنية لدرس واحد فقط.

لغة الخريطة الذهنية إجبارية: ${lang.label} حصراً.
كل عناوين الفروع والنقاط يجب أن تكون بهذه اللغة فقط (ليس العربية إلا إذا كانت لغة المادة عربية).

${mathInstruction}

أرجع JSON بهذا الشكل حصراً:
{
  "title": "المفهوم الرئيسي",
  "children": [
    {
      "title": "فرع",
      "children": [{ "title": "نقطة" }]
    }
  ]
}

القواعد:
- المستوى 1: عنوان رئيسي واحد (عنوان الدرس أو فكرته المحورية) بلغة ${lang.label}
- المستوى 2: 3 إلى 6 فروع رئيسية بلغة ${lang.label}
- المستوى 3: لكل فرع 2 إلى 4 نقاط قصيرة بلغة ${lang.label}
- لا تتجاوز 3 مستويات
- التزم بالمنهاج الجزائري لمستوى ${studentLevel || "الطالب"} وشعبة ${studentStream || "دراسته"}
- لا تخترع محتوى خارج موضوع الدرس
- لا تضف أي نص خارج JSON`;

    const userPrompt = `الدرس: ${lesson.title}
المادة: ${lesson.subjectTitle}
لغة الإخراج المطلوبة: ${lang.label}
الشهر: ${lesson.month}
الوصف: ${lesson.description || "غير متوفر"}
الملحقات: ${materialsList}

أنشئ الخريطة الذهنية الآن بلغة ${lang.label}.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ];

    let content = "";
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 2000,
        messages,
      });
      content = response.choices[0]?.message?.content || "";
    } catch (err: any) {
      console.warn("gpt-4o-mini mindmap fallback:", err?.message);
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 2000,
        messages,
      });
      content = response.choices[0]?.message?.content || "";
    }

    const tree = extractTree(content);

    if (!tree) {
      console.error("lesson-mindmap invalid JSON:", content.slice(0, 500));
      return NextResponse.json(
        { error: "تعذر إنشاء الخريطة الذهنية، حاول مرة أخرى" },
        { status: 502 }
      );
    }

    if (!tree.title) {
      tree.title = lesson.title;
    }

    return NextResponse.json({ tree, language: lang.code });
  } catch (error) {
    console.error("lesson-mindmap error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الخريطة الذهنية" },
      { status: 500 }
    );
  }
}
