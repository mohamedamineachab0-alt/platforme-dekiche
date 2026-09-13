import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { assertStudentLessonAccess } from "@/lib/lesson-access";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      lessonId,
      messages,
      prompt,
      studentName,
      studentLevel,
      studentStream,
      studentPoints,
      studentMistakes,
    } = body;

    if (!lessonId || !prompt) {
      return NextResponse.json({ error: "الحقول المطلوبة ناقصة" }, { status: 400 });
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

    const chatHistory = Array.isArray(messages)
      ? messages.map((msg: { role: string; content: string }) => ({
          role: msg.role,
          content: msg.content,
        }))
      : [];

    chatHistory.push({ role: "user", content: prompt });

    const systemPrompt = {
      role: "system" as const,
      content: `أنت المساعد الذكي التعليمي لمنصة دقيش (المنصة الوطنية للتعليم الجزائري).
تساعد الطالب على فهم درس محدد فقط، بأسلوب بيداغوجي واضح دون إعطاء حلول جاهزة للتمارين.

### سياق الدرس الحالي:
- عنوان الدرس: ${lesson.title}
- المادة: ${lesson.subjectTitle}
- الشهر: ${lesson.month}
- وصف الدرس: ${lesson.description || "غير متوفر"}
- ملحقات الدرس: ${materialsList}

### سياق الطالب:
- الاسم: ${studentName || "طالب"}
- المستوى: ${studentLevel || "غير متوفر"}
- الشعبة: ${studentStream || "غير متوفر"}
- النقاط: ${studentPoints || 0}
- أخطاؤه في هذا الدرس: ${studentMistakes || "لا توجد"}

### القواعد:
1. تكلم بالعربية الفصحى السليمة، بأسلوب مشجع وواضح.
2. اربط إجاباتك بهذا الدرس والمنهاج الجزائري لمستوى ${studentLevel || "الطالب"} وشعبة ${studentStream || "دراسته"}.
3. إذا خرج السؤال عن الدرس أو المنهاج، قل ذلك بصراحة ولا تخترع معلومات.
4. لا تعطِ الحل النهائي المباشر للتمارين؛ قدّم تلميحات وخطوات فهم.
5. استخدم فقرات قصيرة وقوائم نقطية مناسبة للهاتف.`,
    };

    const completion = await groq.chat.completions.create({
      messages: [systemPrompt, ...chatHistory] as any,
      model: "allam-2-7b",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply =
      completion.choices[0]?.message?.content || "حدث خطأ أثناء المعالجة";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("lesson-chat error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء الاتصال بالمساعد الذكي" },
      { status: 500 }
    );
  }
}
