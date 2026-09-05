import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'مفتاح OpenAI مفقود في إعدادات الخادم (OPENAI_API_KEY)' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const metadataStr = formData.get('metadata') as string;
    const type = (formData.get('type') as string) || 'daily_exercise';
    const customPrompt = formData.get('customPrompt') as string | null;

    if (!files || files.length === 0 || !metadataStr) {
      return NextResponse.json({ error: 'Missing required fields (files or metadata)' }, { status: 400 });
    }

    let metadata: any = {};
    try {
      metadata = JSON.parse(metadataStr);
    } catch {
      metadata = {};
    }

    const { level, stream, subject, month, maxScore, numberOfQuestions } = metadata;
    const qCount = Number(numberOfQuestions) > 0 ? Number(numberOfQuestions) : 5;
    const score = Number(maxScore) > 0 ? Number(maxScore) : 20;

    const systemPrompt = `أنت خبير تعليمي ومفتش تربوي معتمد للمنهاج الجزائري.
مهمتك: تحليل الوثيقة/الصور المرفقة (فرض، اختبار، درس، أو تمرين) للمستوى: ${level || 'غير محدد'}، الشعبة: ${stream || 'عام'}، المادة: ${subject || 'عام'}، الشهر: ${month || 'غير محدد'}.

المطلوب:
1. استخرج أو ولد كويز رقمي (QCM / Multiple Choice Quiz) عالي الدقة مبني كلياً على الوثيقة.
2. عدد الأسئلة المطلوب بدقة: ${qCount} أسئلة.
3. لكل سؤال 4 خيارات حصرية (options) لا غير، واحد منها فقط صحيح.
4. حدد 'correctAnswerIndex' برقم صحيح بين 0 و 3 يشير إلى مكان الخيار الصحيح.
5. لغة الأسئلة والخيارات يجب أن تطابق لغة الوثيقة تماماً (عربية، فرنسية، إنجليزية).
6. للمعادلات الرياضية أو العلمية، استخدم تنسيق LaTeX محاطاً بعلامة $ (مثال: $f(x) = x^2 + 1$).
7. الإخراج يجب أن يكون JSON فقط يحتوي على مصفوفة باسم 'questions':
{
  "questions": [
    {
      "question": "نص السؤال هنا",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      "correctAnswerIndex": 0
    }
  ]
}
تحذير صارم: لا تخرج أي نصوص إضافية خارج كائن الـ JSON.`;

    // Process all files
    const userContent: any[] = [
      {
        type: 'text',
        text: `بناءً على الوثائق المرفقة، قم باستخراج ${qCount} أسئلة متعددة الخيارات (QCM) بمجموع علامات ${score}:`,
      },
    ];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || 'image/jpeg';

      if (mimeType.startsWith('image/')) {
        const base64Image = fileBuffer.toString('base64');
        userContent.push({
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`,
            detail: 'high',
          },
        });
      } else if (mimeType === 'application/pdf') {
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(fileBuffer);
        userContent.push({
          type: 'text',
          text: `[نص من ملف PDF: ${file.name}]\n\n${pdfData.text}`,
        });
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
      ) {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        userContent.push({
          type: 'text',
          text: `[نص من ملف Word: ${file.name}]\n\n${result.value}`,
        });
      } else {
        // Default to attempting image extraction or error
        const base64Fallback = fileBuffer.toString('base64');
        userContent.push({
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${base64Fallback}`,
            detail: 'high',
          },
        });
      }
    }

    if (customPrompt) {
      userContent.push({
        type: 'text',
        text: `تعليمات إضافية من الأستاذ: ${customPrompt}`,
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: userContent,
        },
      ],
      temperature: 0.2,
      max_tokens: 3500,
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
      : (parsed.questions || parsed.quiz || []);

    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      throw new Error('لم ينجح الذكاء الاصطناعي في استخراج الأسئلة من الوثيقة المرفقة');
    }

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
      };
    });

    return NextResponse.json({ questions: sanitizedQuestions });
  } catch (error: any) {
    console.error('AI Generation Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'فشل توليد الأسئلة، يرجى التأكد من وضوح الوثيقة' },
      { status: 500 }
    );
  }
}
