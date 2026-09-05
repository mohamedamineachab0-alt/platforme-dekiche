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

    const systemPrompt = `أنت خبير فك وتحليل الخطوط اليدوية (Expert Handwriting OCR) ومفتش تربوي معتمد للمنهاج الجزائري (بكالوريا وتعليم ثانوي).

المهمة الأساسية:
قراءة الوثائق والمستندات والصور المرفقة، وفك كافة أنواع الخطوط المكتوبة باليد (خط اليد للأساتذة والتلاميذ، الملاحظات الهامشية، العناوين، والرموز والمعادلات الرياضية والفيزيائية اليدوية)، واستخراج كويز رقمي (QCM) دقيق ومطابق 100% لمحتوى الوثيقة حصراً.

قواعد الالتزام الصارم (عدم التخليط وعدم التأليف):
1. الالتزام المطلق بمحتوى الوثيقة: ممنوع منعاً باتاً تأليف أسئلة من الذاكرة العامة أو إضافة معلومات من خارج الوثائق المرفقة. كل سؤال وكل خيار يجب أن يكون مستنبطاً ومثبتاً مباشرة في نص أو صور الملف المرفق.
2. فك خط اليد بامتياز: اقرأ الكلمات والرموز المكتوبة باليد بعناية فائقة. إذا كانت هناك مصطلحات فرنسية أو تقنية أو قوانين علمية مكتوبة باليد، حللها بدقة واستخرج الأسئلة بناءً عليها.
3. عدد الأسئلة المطلوب بدقة تامة: ${qCount} أسئلة.
4. بنية كل سؤال (QCM):
   - 'question': نص السؤال واضح ومحدد مستخلص حصراً من الوثيقة.
   - 'options': 4 خيارات حصرية وذكية، واحد منها فقط صحيح وثلاثة خيارات خاطئة مستوحاة من نفس الدرس.
   - 'correctAnswerIndex': رقم صحيح (0 أو 1 أو 2 أو 3) يشير لموضع الخيار الصحيح.
5. لغة الصياغة: اكتب الأسئلة والخيارات بنفس لغة ومصطلحات الوثيقة المرفقة (عربية، فرنسية، إنجليزية).
6. الصياغة العلمية والرياضية: استخدم LaTeX بين علامتي $ لأي معادلة أو رمز علمي (مثال: $f(x) = \\frac{2x+1}{x-3}$ أو $[H_3O^+]$).
7. التنسيق: أخرج كائن JSON حصراً يحتوي على مصفوفة باسم 'questions' دون أي نصوص أو شروحات إضافية:
{
  "questions": [
    {
      "question": "نص السؤال المستخرج حصراً من الوثيقة",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      "correctAnswerIndex": 0
    }
  ]
}`;

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

    let response;
    try {
      response = await openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: userContent,
          },
        ],
        temperature: 0.1,
        max_tokens: 3500,
      });
    } catch (modelErr: any) {
      console.warn('gpt-4o failed, falling back to gpt-4o-mini:', modelErr?.message);
      response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: userContent,
          },
        ],
        temperature: 0.1,
        max_tokens: 3500,
      });
    }

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
