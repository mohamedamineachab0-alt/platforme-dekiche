import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isStemSubject(subject?: string | null): boolean {
  if (!subject) return false;
  const s = subject.trim().toLowerCase();
  return /رياضيات|math|فيزياء|كيمياء|physique|chimie|علوم الطبيعة|طبيعة و حياة|علوم طبيعية|snv|biologie|science|sciences/i.test(s);
}

function getSubjectLanguage(subject?: string | null): string {
  if (!subject) return 'العربية';
  const s = subject.trim().toLowerCase();
  if (/فرنسية|français|french|francais/i.test(s)) return 'الفرنسية (French)';
  if (/إنجليزية|english|anglais|انجليزية/i.test(s)) return 'الإنجليزية (English)';
  if (/إسبانية|اسبانية|español|spanish/i.test(s)) return 'الإسبانية (Spanish)';
  if (/ألمانية|المانية|allemand|deutsch|german/i.test(s)) return 'الألمانية (German)';
  if (/إيطالية|ايطالية|italien|italian/i.test(s)) return 'الإيطالية (Italian)';
  return 'العربية (Arabic)';
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'مفتاح OpenAI مفقود في إعدادات الخادم (OPENAI_API_KEY)' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      lessonId,
      pdfUrls = [],
      lessonTitle,
      subjectTitle,
      level,
      stream,
      numberOfCards = 5,
      forcedLanguage,
    } = body;

    const hasAnyPdf = Array.isArray(pdfUrls) && pdfUrls.length > 0;
    
    const count = Number(numberOfCards) > 0 ? Number(numberOfCards) : 5;
    const isStem = isStemSubject(subjectTitle);
    
    // Use forcedLanguage if provided, otherwise detect from subject
    const targetLanguage = forcedLanguage && forcedLanguage !== "auto" 
      ? forcedLanguage 
      : getSubjectLanguage(subjectTitle);

    const mathInstruction = isStem
      ? "المادة علمية/رياضية: يجب إلزامياً كتابة كافة المعادلات والصيغ والرموز بصيغة LaTeX محاطة بـ $ (مثال: $f(x)=2x+1$ أو $E=mc^2$ أو \\\\(\\vec{F}\\\\) أو \\\\(\\tau=RC\\\\))."
      : "المادة أدبية/لغوية/حفظ: لا تقم باستخدام أي صياغات رياضية معقدة، ركز على النصوص الدقيقة والأدبية.";

    const systemPrompt = `أنت أستاذ جزائري خبير ومحترف في إنشاء بطاقات المراجعة (Flashcards) وفق المناهج التعليمية الجزائرية الرسمية.
مهمتك الآن استخراج وتوليد مجموعة من بطاقات المراجعة لدرس معين.

المعلومات الأساسية للدرس:
- عنوان الدرس: ${lessonTitle || 'درس تعليمي'}
- المادة المقررة: ${subjectTitle || 'المادة المحددة'}
- لغة صياغة البطاقات: ${targetLanguage} حصراً.
- المستوى والشعبة: ${level || 'التعليم الثانوي'} - ${stream || 'عام'}
${hasAnyPdf ? `- روابط ملفات ومرفقات الدرس (للاستئناس أو التلخيص إن أمكن):` : ''}
${Array.isArray(pdfUrls) ? pdfUrls.map((url: string) => `  - ${url}`).join('\n') : ''}

القواعد الصارمة:
1. لغة البطاقات: تصاغ الأسئلة والأجوبة بلغة [${targetLanguage}] حصراً وبدقة تامة.
2. ${mathInstruction}
3. الأسئلة: يجب أن تكون الأسئلة قصيرة، مباشرة، ومركزة على مفاهيم، تعاريف، أو قوانين محددة.
4. الأجوبة: يجب أن تكون الإجابات دقيقة ومختصرة لتناسب أسلوب المراجعة السريعة (Flashcards).
5. العدد: يجب توليد بالضبط ${count} بطاقات مراجعة.

الصيغة المطلوبة (JSON فَقَط بدون أي كود أو Markdown أو نصوص إضافية خارج الـ JSON):
{
  "cards": [
    {
      "question": "نص السؤال هنا",
      "answer": "نص الجواب المباشر هنا"
    }
  ]
}`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `قم فوراً بتوليد ${count} بطاقات مراجعة لدرس "${lessonTitle || 'الدرس'}" في مادة "${subjectTitle || 'المادة'}" وفق المنهاج الجزائري الرسمي:`
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages,
      max_tokens: 3000,
      temperature: 0.3, // Lower temp for factual recall
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('لم يتم استلام أي إجابة من OpenAI');
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(result);
    } catch (e) {
      throw new Error('فشل في تحليل رد الذكاء الاصطناعي (JSON غير صالح)');
    }

    if (!parsed.cards || !Array.isArray(parsed.cards)) {
      throw new Error('صيغة غير صحيحة، تم إرجاع استجابة غير متوافقة.');
    }

    // Try to auto-save to DB if lessonId is provided
    let saved = false;
    let newCards = [];
    if (lessonId) {
      try {
        const lesson = await prisma.lesson.findUnique({
          where: { id: lessonId },
          select: { subjectId: true, month: true, levels: true, streams: true }
        });

        if (lesson) {
          const lLevel = lesson.levels?.[0] || level || "AS3";
          const lStream = lesson.streams?.[0] || stream || "SCIENCES";

          // Insert multiple review cards
          const inserts = parsed.cards.map((c: any) => ({
            title: lessonTitle,
            question: c.question,
            answer: c.answer,
            subjectId: lesson.subjectId,
            level: lLevel,
            stream: lStream,
            month: lesson.month,
            exerciseRef: lessonTitle
          }));

          await prisma.reviewCard.createMany({
            data: inserts
          });
          
          saved = true;
          newCards = inserts;
        }
      } catch (saveError) {
        console.error("Auto-save review cards failed:", saveError);
      }
    }

    return NextResponse.json({
      success: true,
      cards: parsed.cards,
      saved
    });

  } catch (error: any) {
    console.error("AI Generate Review Cards Error:", error);
    return NextResponse.json(
      { error: error?.message || 'حدث خطأ داخلي أثناء توليد بطاقات المراجعة' },
      { status: 500 }
    );
  }
}
