import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { openai } from "@/lib/openai";
import { decryptSession } from "@/lib/security";
import { prisma } from "@/lib/prisma";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "غير مسجل الدخول" }, { status: 401 });
    }

    const payload = await decryptSession(sessionToken);
    const userId = (payload?.userId as string) || null;
    if (!userId) {
      return NextResponse.json({ error: "جلسة غير صالحة" }, { status: 401 });
    }

    const body = await req.json();
    const { mode, lessonId, messages, prompt } = body as {
      mode: "chat" | "mindmap";
      lessonId: string;
      messages?: ChatMessage[];
      prompt?: string;
    };

    if (!lessonId || !mode) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        subject: { select: { title: true, teacherName: true } },
        materials: { select: { title: true } },
      },
    });

    if (!lesson || !lesson.isPublished) {
      return NextResponse.json({ error: "الدرس غير موجود" }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_subjectId: {
          studentId: userId,
          subjectId: lesson.subjectId,
        },
      },
    });

    if (!enrollment || !enrollment.enrolledMonths.includes(lesson.month)) {
      return NextResponse.json({ error: "الدرس غير مفعّل في اشتراكك" }, { status: 403 });
    }

    const student = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true },
    });

    const materialTitles =
      lesson.materials.length > 0
        ? lesson.materials.map((m) => m.title).join("، ")
        : "لا توجد ملحقات";

    const lessonContext = `
عنوان الدرس: ${lesson.title}
المادة: ${lesson.subject.title}
الأستاذ: ${lesson.subject.teacherName}
الشهر: ${lesson.month}
وصف الدرس: ${lesson.description || "غير متوفر"}
ملحقات الدرس: ${materialTitles}
مستوى الطالب: ${student?.studentProfile?.level || "غير محدد"}
شعبة الطالب: ${student?.studentProfile?.stream || "غير محدد"}
`.trim();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "المساعد الذكي غير متاح حالياً" }, { status: 503 });
    }

    if (mode === "mindmap") {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content: `أنت خبير بيداغوجي للمنهاج الجزائري. مهمتك توليد خريطة ذهنية واضحة ومنظمة لدرس معيّن.

أخرج JSON فقط بهذا الشكل:
{
  "title": "عنوان مركزي قصير للدرس",
  "branches": [
    {
      "label": "محور رئيسي",
      "children": [
        { "label": "فكرة فرعية قصيرة" },
        { "label": "فكرة فرعية قصيرة" }
      ]
    }
  ]
}

القواعد:
- العربية الفصحى فقط
- 4 إلى 6 محاور رئيسية
- كل محور فيه 2 إلى 4 أفكار فرعية قصيرة
- ركّز على مفاهيم الدرس حسب العنوان والوصف والمنهاج الجزائري
- لا تضف شروحات طويلة داخل العناوين`,
          },
          {
            role: "user",
            content: `أنشئ خريطة ذهنية لهذا الدرس:\n\n${lessonContext}`,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return NextResponse.json({ error: "فشل توليد الخريطة الذهنية" }, { status: 500 });
      }

      const mindmap = JSON.parse(content);
      return NextResponse.json({ mindmap });
    }

    // mode === "chat"
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "اكتب سؤالك أولاً" }, { status: 400 });
    }

    const history = (messages || []).slice(-12).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 1200,
      messages: [
        {
          role: "system",
          content: `أنت المساعد الذكي داخل صفحة درس في منصة دقيش التعليمية.
أجب بالعربية الفصحى بأسلوب واضح ومشجّع ومناسب للمستوى الثانوي الجزائري.

سياق الدرس الحالي (التزم به):
${lessonContext}

القواعد:
- اشرح مفاهيم هذا الدرس فقط، واربط الإجابة بعنوانه ومادته
- لا تعطِ حلولاً جاهزة للكويز أو التمارين؛ قدّم تلميحات وخطوات فهم
- إذا خرج السؤال عن الدرس، وجّه الطالب بلطف للعودة لمحتوى الدرس
- استخدم فقرات قصيرة ونقاط عند الحاجة`,
        },
        ...history,
        { role: "user", content: prompt.trim() },
      ],
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ||
      "تعذّر الحصول على رد حالياً حاول مرة أخرى";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("lesson-ai error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء الاتصال بالمساعد" }, { status: 500 });
  }
}
