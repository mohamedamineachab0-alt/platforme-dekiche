"use server";

import { openai } from "@/lib/openai";

export type GeneratedQuizQuestion = {
  question: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
  points?: number;
};

export async function generateQuizFromImage(
  base64Image: string,
  mimeType: string = "image/jpeg",
  options?: { numberOfQuestions?: number; totalPoints?: number }
): Promise<GeneratedQuizQuestion[]> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("مفتاح OpenAI مفقود في إعدادات النظام (OPENAI_API_KEY)");
    }

    const numQuestions = options?.numberOfQuestions || 5;
    const totalPoints = options?.totalPoints || 20;

    const imageUrl = base64Image.startsWith("data:")
      ? base64Image
      : `data:${mimeType};base64,${base64Image}`;

    const systemPrompt = `أنت خبير تربوي ومفتش تعليمي معتمد للمنهاج الجزائري.
مهمتك: تحليل صورة التمرين أو الفرض أو الدرس المرفقة، واستخراج أو توليد كويز دقيق جداً بصيغة أسئلة متعددة الخيارات (QCM / MCQ).

شروط الإخراج:
1. استخرج بالضبط ${numQuestions} أسئلة مستمدة مباشرة من محتوى الصورة.
2. لكل سؤال يجب توفير 4 خيارات حصرية (options) غير مكررة ومنطقية.
3. حدد رقم الخيار الصحيح (correctAnswerIndex) من 0 إلى 3.
4. يجب أن تكون صياغة الأسئلة والخيارات بنفس لغة الوثيقة (عربية، فرنسية، إنجليزية).
5. إذا كان المحتوى يتضمن معادلات أو رموزاً رياضية أو فيزيائية، استخدم صيغة LaTeX بين علامتي $ (مثل $f(x) = 2x + 1$).
6. أخرج النتيجة فقط بتنسيق JSON حصراً يحتوي على مصفوفة باسم 'questions':
{
  "questions": [
    {
      "question": "نص السؤال الأول هنا",
      "options": ["الخيار 1", "الخيار 2", "الخيار 3", "الخيار 4"],
      "correctAnswerIndex": 0
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 3000,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "قم باستخراج الكويز من هذه الصورة بدقة:" },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("لم يتم استلام أي رد من OpenAI");
    }

    const parsed = JSON.parse(content);
    const questionsArray = Array.isArray(parsed) ? parsed : parsed.questions || parsed.quiz || [];

    if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
      throw new Error("لم يتمكن الذكاء الاصطناعي من استخراج أسئلة صالحة من الصورة");
    }

    const pointsPerQuestion = Number((totalPoints / questionsArray.length).toFixed(1));

    return questionsArray.map((q: any) => {
      let correctIdx = 0;
      if (typeof q.correctAnswerIndex === "number" && q.correctAnswerIndex >= 0 && q.correctAnswerIndex <= 3) {
        correctIdx = q.correctAnswerIndex;
      } else if (typeof q.correct_answer === "string") {
        const letter = q.correct_answer.trim().toUpperCase()[0];
        if (letter === "A" || letter === "1") correctIdx = 0;
        else if (letter === "B" || letter === "2") correctIdx = 1;
        else if (letter === "C" || letter === "3") correctIdx = 2;
        else if (letter === "D" || letter === "4") correctIdx = 3;
      }

      return {
        question: String(q.question || ""),
        options: [
          String(q.options?.[0] || "الخيار 1"),
          String(q.options?.[1] || "الخيار 2"),
          String(q.options?.[2] || "الخيار 3"),
          String(q.options?.[3] || "الخيار 4"),
        ] as [string, string, string, string],
        correctAnswerIndex: correctIdx,
        points: pointsPerQuestion,
      };
    });
  } catch (error: any) {
    console.error("OpenAI Quiz Generation Error:", error);
    throw new Error(error.message || "فشل توليد الكويز تأكد من جودة الصورة أو إعدادات المفتاح");
  }
}

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function askStudentAssistant(
  studentId: string,
  history: ChatMessage[],
  newMessage: string
) {
  // Mock logic to unbreak the build
  return "عذراً، هذا الرد مؤقت حتى يتم ربط النظام بالمساعد الذكي الفعلي.";
}
