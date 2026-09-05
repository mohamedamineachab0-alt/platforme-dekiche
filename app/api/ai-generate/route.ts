import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { extractTextFromPdf } from '@/lib/pdf-parser';

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
    const files = (formData.getAll('files') as File[]).filter(f => f && f.size > 0);
    const fileUrlsStr = formData.get('fileUrls') as string | null;
    let fileUrls: { url: string; name?: string; type?: string }[] = [];
    if (fileUrlsStr) {
      try {
        const parsed = JSON.parse(fileUrlsStr);
        if (Array.isArray(parsed)) {
          fileUrls = parsed.map(item => typeof item === 'string' ? { url: item } : item);
        }
      } catch (e) {
        console.warn('Failed to parse fileUrls:', e);
      }
    }

    if (files.length === 0 && fileUrls.length === 0) {
      return NextResponse.json(
        { error: 'يرجى تزويد ملفات أو تحديد ملحقات الدرس لتوليد الكويز' },
        { status: 400 }
      );
    }

    const metadataStr = formData.get('metadata') as string;
    const customPrompt = formData.get('customPrompt') as string | null;

    let metadata: any = {};
    if (metadataStr) {
      try {
        metadata = JSON.parse(metadataStr);
      } catch {
        metadata = {};
      }
    }

    const { level, stream, subject, month, maxScore, numberOfQuestions } = metadata;
    const qCount = Number(numberOfQuestions) > 0 ? Number(numberOfQuestions) : 5;
    const score = Number(maxScore) > 0 ? Number(maxScore) : 20;

    const systemPrompt = `أنت خبير تعليمي ومفتش تربوي معتمد للمنهاج الجزائري.
مهمتك: تحليل الوثيقة/المحتوى التعليمي المرفق (فرض، اختبار، درس، أو تمرين) للمستوى: ${level || 'غير محدد'}، الشعبة: ${stream || 'عام'}، المادة: ${subject || 'عام'}، الشهر: ${month || 'غير محدد'}.

المطلوب:
1. استخرج أو ولد كويز رقمي (QCM / Multiple Choice Quiz) عالي الدقة مبني كلياً على محتوى الدرس أو الوثيقة.
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

    const userContent: any[] = [
      {
        type: 'text',
        text: `بناءً على ملفات ووثائق الدرس المرفقة، قم باستخراج وتوليد ${qCount} أسئلة متعددة الخيارات (QCM) بمجموع علامات ${score}:`,
      },
    ];

    // Process uploaded File objects
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
      } else if (mimeType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const text = await extractTextFromPdf(fileBuffer);
        if (text) {
          userContent.push({
            type: 'text',
            text: `[نص مستخرج من ملف الدرس PDF: ${file.name}]\n\n${text}`,
          });
        }
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
      ) {
        try {
          const mammoth = require('mammoth');
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          userContent.push({
            type: 'text',
            text: `[نص مستخرج من ملف الدرس Word: ${file.name}]\n\n${result.value}`,
          });
        } catch (wordErr) {
          console.warn('Word parse failed:', wordErr);
        }
      } else {
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

    // Process remote file URLs (e.g. existing materials stored in Supabase)
    for (let i = 0; i < fileUrls.length; i++) {
      const item = fileUrls[i];
      try {
        const res = await fetch(item.url);
        if (!res.ok) continue;
        const arrayBuf = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const contentType = (res.headers.get('content-type') || item.type || '').toLowerCase();

        if (contentType.startsWith('image/') || item.url.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
          const b64 = buffer.toString('base64');
          const mime = contentType.startsWith('image/') ? contentType : 'image/jpeg';
          userContent.push({
            type: 'image_url',
            image_url: {
              url: `data:${mime};base64,${b64}`,
              detail: 'high',
            },
          });
        } else if (contentType.includes('pdf') || item.url.match(/\.pdf$/i)) {
          const text = await extractTextFromPdf(buffer);
          if (text) {
            userContent.push({
              type: 'text',
              text: `[نص من ملحق الدرس: ${item.name || `ملحق ${i + 1}`}]\n\n${text}`,
            });
          }
        } else if (
          contentType.includes('word') ||
          contentType.includes('officedocument') ||
          item.url.match(/\.(docx|doc)$/i)
        ) {
          try {
            const mammoth = require('mammoth');
            const result = await mammoth.extractRawText({ buffer });
            userContent.push({
              type: 'text',
              text: `[نص من ملحق الدرس Word: ${item.name || `ملحق ${i + 1}`}]\n\n${result.value}`,
            });
          } catch (wordErr) {
            console.warn('Remote Word parse failed:', wordErr);
          }
        }
      } catch (fetchErr) {
        console.error('Failed to fetch remote material:', item.url, fetchErr);
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
