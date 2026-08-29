import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const metadataStr = formData.get('metadata') as string;
    const type = formData.get('type') as string;
    const customPrompt = formData.get('customPrompt') as string | null;

    if (!files || files.length === 0 || !metadataStr || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const metadata = JSON.parse(metadataStr);
    const { level, stream, subject, month, maxScore } = metadata;
    
    let systemPrompt = '';
    
    if (type === 'daily_exercise') {
      systemPrompt = `أنت خبير تعليمي محترف ومفتش تربوي. قم بتحليل المحتوى التعليمي المرفق للمستوى: ${level}، الشعبة: ${stream || 'غير محدد'}، المادة: ${subject}، الشهر: ${month}.
      يجب عليك استخراج/توليد أسئلة اختبار (Quiz) دقيقة وعالية الجودة بناءً على المحتوى، وتكون متوافقة تماماً مع المنهج الدراسي الرسمي.
      يجب أن يتم صياغة الأسئلة والخيارات بنفس لغة المحتوى المرفق (سواء كانت عربية، فرنسية، إنجليزية، أو غيرها).
      قم بإخراج النتيجة بصيغة كائن JSON حصراً يحتوي على مصفوفة باسم 'questions'.
      كل كائن سؤال (question object) يجب أن يحتوي بدقة على:
      - 'question': نص (نص السؤال)
      - 'options': مصفوفة من 4 نصوص (الخيارات الممكنة للإجابة)
      - 'correctAnswerIndex': رقم (من 0 إلى 3 يشير إلى الخيار الصحيح)
      الرجاء استخدام صيغة التنسيق LaTeX للمعادلات الرياضية ($...$) مع وضع علامتي شرطة مائلة مزدوجة (double-escape backslashes) إن لزم الأمر.
      تحذير صارم: لا تقم بتأليف أسئلة عشوائية أو عامة. يجب أن تكون الأسئلة مستمدة حصراً وبدقة من المحتوى المرفق.`;
    } else if (type === 'exam') {
       systemPrompt = `أنت خبير تعليمي محترف ومفتش تربوي. قم بتحليل المحتوى التعليمي المرفق للمستوى: ${level}، الشعبة: ${stream || 'غير محدد'}، المادة: ${subject}، الشهر: ${month}.
      استخرج أسئلة اختبار (Exam) شاملة، مع توزيع نقاط بمجموع كلي يساوي ${maxScore || 20} علامة، مع التأكد من مطابقتها الدقيقة للمنهج الدراسي الرسمي.
      يجب أن تكون صياغة الأسئلة والإجابات بنفس لغة المحتوى المرفق (عربية، فرنسية، إنجليزية، إلخ).
      قم بإخراج النتيجة بصيغة كائن JSON حصراً يحتوي على مصفوفة باسم 'questions'.
      كل كائن سؤال (question object) يجب أن يحتوي بدقة على:
      - 'question': نص (نص السؤال المستخرج)
      - 'modelAnswer': نص (الإجابة النموذجية المقترحة)
      - 'allocatedMarks': رقم (النقاط المخصصة للسؤال، ويجب أن يكون مجموعها ${maxScore || 20})
      الرجاء استخدام صيغة التنسيق LaTeX للمعادلات الرياضية ($...$) مع وضع علامتي شرطة مائلة مزدوجة (double-escape backslashes).
      تحذير صارم: لا تقم بتأليف أسئلة عشوائية أو عامة. يجب أن تكون الأسئلة مستمدة حصراً وبدقة من المحتوى المرفق.`;
    }

    if (customPrompt) {
      systemPrompt += `\n\nUSER'S ADDITIONAL INSTRUCTIONS:\n${customPrompt}`;
    }

    // Process all files
    let userContent: any[] = [{ type: 'text', text: 'بناءً على المحتوى التعليمي التالي، قم بتوليد الأسئلة المطلوبة وفقاً للشروط المحددة مسبقاً:' }];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type;

      if (mimeType.startsWith('image/')) {
        const base64Image = fileBuffer.toString('base64');
        userContent.push({ type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } });
      } else if (mimeType === 'application/pdf') {
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(fileBuffer);
        userContent.push({ type: 'text', text: `Here is the extracted text from PDF document ${i + 1} (${file.name}):\n\n${pdfData.text}` });
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        userContent.push({ type: 'text', text: `Here is the extracted text from Word document ${i + 1} (${file.name}):\n\n${result.value}` });
      } else {
        return NextResponse.json({ error: `Unsupported file type for file ${file.name}. Please upload Image, PDF, or Word documents.` }, { status: 400 });
      }
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Kept fast model similar to generate-quiz
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: userContent,
        },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) throw new Error('No response from AI');

    return NextResponse.json(JSON.parse(result));
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate questions, please try a clearer file' }, { status: 500 });
  }
}
