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
      imageBase64,
      pdfUrl,
      vimeoUrl,
      lessonTitle,
      subjectTitle,
      level,
      stream,
      numberOfQuestions = 5,
      totalPoints = 20,
    } = body;

    const qCount = Number(numberOfQuestions) > 0 ? Number(numberOfQuestions) : 5;
    const score = Number(totalPoints) > 0 ? Number(totalPoints) : 20;
    const isStem = isStemSubject(subjectTitle);

    const mathInstruction = isStem
      ? "المادة علمية/رياضية: يجب إلزامياً كتابة كافة المعادلات والصيغ والرموز بصيغة LaTeX محاطة بـ $ (مثال: $f(x)=2x+1$ أو $E=mc^2$ أو $\\vec{F}$ أو $\\tau=RC$)."
      : "المادة أدبية/لغوية/إنسانية (ليست رياضيات ولا فيزياء ولا علوم): يمنع منعاً باتاً ومطلقاً استخدام لغة LaTeX أو وضع أي علامات $ في الأسئلة أو الخيارات! تصاغ كل الأسئلة والخيارات بنصوص عادية واضحة بدون رموز رياضية.";

    const systemPrompt = `أنت كبير مفتشي الامتحانات ومصممي بنوك الأسئلة في منصة "ديكيش أكاديمي" للمنهاج الجزائري الرسمي (بكالوريا، ثانوي، ومتوسط).
مهمتك: توليد كويز اختباري نموذجي يتكون من بالضبط ${qCount} أسئلة اختيار من متعدد (QCM) بمجموع علامات ${score}.

المعلومات المحددة:
- عنوان الدرس: ${lessonTitle || 'درس تعليمي'}
- المادة المقررة: ${subjectTitle || 'المادة المحددة'}
- المستوى والشعبة: ${level || 'التعليم الثانوي'} - ${stream || 'عام'}
${vimeoUrl ? `- رابط فيديو الحصة (Vimeo): ${vimeoUrl}` : ''}
${pdfUrl ? `- رابط ملف ومرفقات الدرس (PDF/Document): ${pdfUrl}` : ''}

القواعد الصارمة:
1. عدد الأسئلة الإلزامي: بالضبط ${qCount} أسئلة.
2. التخصص الحصري (حظر خلط المواد): كافة الأسئلة والخيارات يجب أن تدور حتماً 100% حول موضوع درس [${lessonTitle || 'الدرس'}] ومادة [${subjectTitle || 'المادة'}] فقط.
3. قاعدة الصياغة الرياضية: ${mathInstruction}
4. لكل سؤال 4 خيارات حصرية ومستقلة: خيار واحد صحيح تماماً، و 3 خيارات خاطئة تمثل مموهات ذكية مستوحاة من أخطاء التلاميذ الشائعة.
5. حدد 'correctAnswerIndex' برقم صحيح (0 إلى 3).
6. الإخراج حصراً كائن JSON بالشكل التالي:
{
  "questions": [
    {
      "question": "نص السؤال",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      "correctAnswerIndex": 0
    }
  ]
}`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    if (imageBase64) {
      const imageUrl = imageBase64.startsWith('data:')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;

      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: `قم باستخراج وتوليد أسئلة الكويز الـ ${qCount} من هذه الوثيقة بدقة علمية كاملة:` },
          { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: `قم فوراً بتوليد الكويز النموذجي لدرس "${lessonTitle || 'الدرس'}" في مادة "${subjectTitle || 'المادة'}" وفق المنهاج الجزائري الرسمي:`
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages,
      max_tokens: 3000,
      temperature: 0.2,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('لم يتم استلام أي إجابة من OpenAI');
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(result);
    } catch {
      const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    const rawQuestions = Array.isArray(parsed)
      ? parsed
      : (parsed.questions || parsed.Questions || parsed.quiz || []);

    const pointsPerQuestion = Number((score / Math.max(rawQuestions.length, 1)).toFixed(1));

    const sanitizedQuestions = rawQuestions.map((q: any, idx: number) => {
      let opts = Array.isArray(q.options) ? q.options.map(String) : [];
      while (opts.length < 4) {
        opts.push(`الخيار ${opts.length + 1}`);
      }
      opts = opts.slice(0, 4);

      let correctIdx = 0;
      if (
        typeof q.correctAnswerIndex === 'number' &&
        q.correctAnswerIndex >= 0 &&
        q.correctAnswerIndex <= 3
      ) {
        correctIdx = q.correctAnswerIndex;
      } else if (typeof q.correct_answer === 'string') {
        const letter = q.correct_answer.trim().toUpperCase()[0];
        if (letter === 'A' || letter === '1') correctIdx = 0;
        else if (letter === 'B' || letter === '2') correctIdx = 1;
        else if (letter === 'C' || letter === '3') correctIdx = 2;
        else if (letter === 'D' || letter === '4') correctIdx = 3;
      } else if (typeof q.correctAnswer === 'string') {
        const matchIdx = opts.findIndex((o: string) => o.trim() === q.correctAnswer.trim());
        if (matchIdx >= 0) correctIdx = matchIdx;
      }

      return {
        id: q.id || `q_${idx + 1}`,
        question: String(q.question || `السؤال ${idx + 1}`),
        options: opts,
        correctAnswerIndex: correctIdx,
        points: pointsPerQuestion,
      };
    });

    let savedQuiz = null;
    if (lessonId) {
      try {
        savedQuiz = await prisma.quiz.upsert({
          where: { lessonId },
          update: {
            questions: sanitizedQuestions,
            maxScore: score,
            aiGenerated: true,
          },
          create: {
            lessonId,
            questions: sanitizedQuestions,
            maxScore: score,
            aiGenerated: true,
          },
        });
      } catch (dbErr) {
        console.error("Auto-save quiz in generate-quiz error:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      questions: sanitizedQuestions,
      saved: !!savedQuiz,
      quizId: savedQuiz?.id
    });
  } catch (error: any) {
    console.error('Error generating AI quiz:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
