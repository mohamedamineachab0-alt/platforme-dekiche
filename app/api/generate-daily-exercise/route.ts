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
      questionCount = 5,
      forcedLanguage,
    } = body;

    const hasAnyPdf = Array.isArray(pdfUrls) && pdfUrls.length > 0;
    const qCount = Number(questionCount) > 0 ? Number(questionCount) : 5;
    const isStem = isStemSubject(subjectTitle);
    
    // Use forcedLanguage if provided, otherwise detect from subject
    const targetLanguage = forcedLanguage && forcedLanguage !== "auto" 
      ? forcedLanguage 
      : getSubjectLanguage(subjectTitle);

    const mathInstruction = isStem
      ? "المادة علمية/رياضية: يجب إلزامياً كتابة كافة المعادلات والصيغ والرموز بصيغة LaTeX محاطة بـ $ (مثال: $f(x)=2x+1$ أو $E=mc^2$ أو \\\\(\\vec{F}\\\\) أو \\\\(\\tau=RC\\\\))."
      : "المادة أدبية/لغوية/حفظ: لا تقم باستخدام أي صياغات رياضية معقدة، ركز على النصوص الدقيقة والأدبية.";

    const systemPrompt = `أنت أستاذ جزائري خبير ومحترف في إعداد التمارين اليومية (QCM/Quiz) وفق المناهج التعليمية الجزائرية الرسمية.
مهمتك الآن استخراج وتوليد تمرين يومي (مجموعة أسئلة خيارات متعددة) لدرس معين.

المعلومات الأساسية للدرس:
- عنوان الدرس: ${lessonTitle || 'درس تعليمي'}
- المادة المقررة: ${subjectTitle || 'المادة المحددة'}
- لغة صياغة التمرين: ${targetLanguage} حصراً.
- المستوى والشعبة: ${level || 'التعليم الثانوي'} - ${stream || 'عام'}
${hasAnyPdf ? `- روابط ملفات ومرفقات الدرس (للاستئناس):` : ''}
${Array.isArray(pdfUrls) ? pdfUrls.map((url: string) => `  - ${url}`).join('\n') : ''}

القواعد الصارمة:
1. لغة الكويز: تُصاغ الأسئلة والخيارات والحلول بلغة [${targetLanguage}] حصراً وبدقة تامة وبدون أي أخطاء إملائية.
2. ${mathInstruction}
3. الخيارات: يجب تقديم 4 خيارات لكل سؤال، مع خيار واحد فقط صحيح.
4. التبرير (Explanation): اشرح سبب صحة الإجابة بشكل مختصر وواضح.
5. العدد: يجب توليد بالضبط ${qCount} أسئلة للتمرين اليومي.

الصيغة المطلوبة (JSON فَقَط بدون أي كود أو Markdown أو نصوص إضافية خارج الـ JSON):
{
  "questions": [
    {
      "question": "نص السؤال هنا",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      "correctAnswer": 0, // رقم الفهرس للإجابة الصحيحة (0 إلى 3)
      "explanation": "شرح مبسط للإجابة الصحيحة"
    }
  ]
}`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `قم فوراً بتوليد ${qCount} أسئلة لتمرين يومي تفاعلي لدرس "${lessonTitle || 'الدرس'}" في مادة "${subjectTitle || 'المادة'}" وفق المنهاج الجزائري الرسمي:`
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages,
      max_tokens: 3500,
      temperature: 0.2,
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

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('صيغة غير صحيحة، تم إرجاع استجابة غير متوافقة.');
    }

    let saved = false;
    let exerciseId = null;

    if (lessonId) {
      try {
        const lesson = await prisma.lesson.findUnique({
          where: { id: lessonId },
          select: { subjectId: true, month: true, levels: true, streams: true }
        });

        if (lesson) {
          const lLevel = lesson.levels?.[0] || level || "AS3";
          const lStream = lesson.streams?.[0] || stream || "SCIENCES";

          // Create the Daily Exercise record
          const dailyExercise = await prisma.dailyExercise.create({
            data: {
              title: `تمرين تفاعلي: ${lessonTitle || 'مراجعة'}`,
              a4ImageUrl: "https://placehold.co/600x800/f8fafc/94a3b8?text=Interactive+Exercise", // Placeholder image
              maxScore: 20,
              level: lLevel,
              stream: lStream,
              subjectId: lesson.subjectId,
              month: lesson.month,
              quiz: {
                create: {
                  maxScore: 20,
                  aiGenerated: true,
                  questions: parsed.questions
                }
              }
            }
          });
          
          saved = true;
          exerciseId = dailyExercise.id;
        }
      } catch (saveError) {
        console.error("Auto-save daily exercise failed:", saveError);
      }
    }

    return NextResponse.json({
      success: true,
      questions: parsed.questions,
      saved,
      exerciseId
    });

  } catch (error: any) {
    console.error("AI Generate Daily Exercise Error:", error);
    return NextResponse.json(
      { error: error?.message || 'حدث خطأ داخلي أثناء توليد التمرين اليومي' },
      { status: 500 }
    );
  }
}
