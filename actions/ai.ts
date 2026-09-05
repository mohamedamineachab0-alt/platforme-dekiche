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

    const systemPrompt = `أنت خبير فك وتحليل الخطوط اليدوية (Expert Handwriting OCR) ومفتش تربوي معتمد للمنهاج الجزائري.
مهمتك: قراءة وتحليل صورة الدرس أو التمرين أو الملخص المرفقة، بما في ذلك أي خط يدوي (Handwriting)، ملاحظات، أو معادلات رياضية مرسومة، واستخراج كويز QCM دقيق مستخلص حصراً ومباشرة من محتوى الصورة.

قواعد صارمة ومطلقة:
1. الالتزام الكامل بالصورة: ممنوع منعاً باتاً اختراع أي سؤال أو إضافة معلومات من خارج الصورة. كل سؤال يجب أن يكون له أصل صريح ومباشر في الصورة.
2. فك خط اليد: اقرأ الكلمات والرموز والكسور المكتوبة بخط اليد بتركيز فائق، واستخرج الأسئلة بناءً على ما كُتب بدقة.
3. استخرج بالضبط ${numQuestions} أسئلة QCM.
4. لكل سؤال 4 خيارات، واحد منها فقط صحيح و 3 خاطئة.
5. حدد رقم الخيار الصحيح (correctAnswerIndex) من 0 إلى 3.
6. استخدم صيغة LaTeX بين علامتي $ للمعادلات والرموز (مثل $f'(x)$).
7. أخرج JSON حصراً بالمصفوفة 'questions':
{
  "questions": [
    {
      "question": "نص السؤال المستخرج حصراً من الصورة",
      "options": ["الخيار 1", "الخيار 2", "الخيار 3", "الخيار 4"],
      "correctAnswerIndex": 0
    }
  ]
}`;

    let response;
    try {
      response = await openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 3000,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "قم بفك الخطوط اليدوية واستخراج الكويز من هذه الصورة بدقة متناهية:" },
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
    } catch (err: any) {
      console.warn("gpt-4o fallback to gpt-4o-mini in generateQuizFromImage:", err?.message);
      response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 3000,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "قم بفك الخطوط اليدوية واستخراج الكويز من هذه الصورة بدقة متناهية:" },
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
    }

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
