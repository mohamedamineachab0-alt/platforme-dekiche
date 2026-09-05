"use server";

import { prisma } from "@/lib/prisma";
import { supabase, ensureBucketExists } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { assertAuth, secureFileGuard } from "@/lib/security";
import { openai } from "@/lib/openai";
import { Level, Stream } from "@/generated/prisma";

/**
 * Helper to upload a File to Supabase Storage and return its public URL
 */
async function uploadToSupabase(rawFile: File, bucketName: string, pathPrefix: string): Promise<string> {
  const { error: guardError, safeFile } = await secureFileGuard(rawFile);
  if (guardError || !safeFile) {
    throw new Error(guardError || "Security check failed for file upload");
  }
  const file = safeFile;

  const ext = file.name.split('.').pop() || "jpg";
  const filePath = `${pathPrefix}-${Date.now()}.${ext}`;
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });
    
  if (error) {
    console.error("Supabase upload error:", error);
    throw new Error("فشل رفع الملف إلى قاعدة البيانات");
  }
  
  const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return publicUrlData.publicUrl;
}

export async function createExam(formData: FormData) {
  try {
    await assertAuth({ requireRole: "ADMIN" });
    const title = formData.get("title") as string;
    const subjectId = formData.get("subjectId") as string;
    const level = formData.get("level") as Level;
    const stream = formData.get("stream") as Stream;
    const month = parseInt(formData.get("month") as string);
    const maxScore = parseInt((formData.get("maxScore") as string) || "20");
    const file = formData.get("file") as File;
    const triggerAi = formData.get("triggerAi") === "true";
    const quizType = formData.get("quizType") as string || (triggerAi ? "AI" : "MANUAL");
    const secondarySubjectId = formData.get("secondarySubjectId") as string || null;

    let materialsData: { title: string, fileUrl: string, fileType?: string }[] = [];
    const rawMaterials = formData.get("materials") as string;
    if (rawMaterials) {
      try {
        materialsData = JSON.parse(rawMaterials);
      } catch (e) {
        console.error("Failed to parse materials JSON");
      }
    }

    let manualQuestionsData: any = [];
    if (quizType === "MANUAL") {
      const rawQs = formData.get("manualQuestions") as string;
      if (rawQs) {
        try {
          const parsed = JSON.parse(rawQs);
          const pointsPerQuestion = 20 / parsed.length;
          manualQuestionsData = parsed.map((q: any) => ({
            ...q,
            points: pointsPerQuestion
          }));
        } catch(e) {
          console.error("Invalid manual questions JSON");
        }
      }
    }

    if (!title || !subjectId || !file) {
      return { error: "يرجى تعبئة جميع الحقول وإرفاق صورة الاختبار" };
    }

    // Upload to bucket 'exam'
    const a4ImageUrl = await uploadToSupabase(file, "exam", `exam-${subjectId}`);

    // Create Exam record
    const exam = await prisma.exam.create({
      data: {
        title,
        subjectId,
        secondarySubjectId,
        level,
        stream,
        month,
        maxScore,
        a4ImageUrl,
        materials: {
          create: materialsData.map(m => ({
            title: m.title,
            fileUrl: m.fileUrl,
            fileType: m.fileType,
          })),
        },
      }
    });

    if (quizType === "MANUAL" && manualQuestionsData.length > 0) {
      await prisma.quiz.create({
        data: {
          examId: exam.id,
          aiGenerated: false,
          maxScore,
          questions: manualQuestionsData,
        }
      });
    } else if (quizType === "AI" || triggerAi) {
      try {
        if (process.env.OPENAI_API_KEY && a4ImageUrl) {
          const promptText = `أنت خبير فك وتحليل الخطوط اليدوية (Handwriting OCR) ومفتش تربوي معتمد للمنهاج الجزائري.
مهمتك: قراءة وتحليل صورة ورقة الامتحان المرفقة، بما في ذلك أي خط يدوي، واستخراج كويز QCM من 5 أسئلة دقيقة مستمدة حصراً من الورقة.
القواعد: ممنوع تأليف أي سؤال من خارج الورقة نهائياً.
أخرج كائن JSON حصراً بمصفوفة 'questions':
{
  "questions": [
    {
      "question": "نص السؤال المستخرج حصراً من الامتحان",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      "correctAnswerIndex": 0
    }
  ]
}`;

          let completion;
          try {
            completion = await openai.chat.completions.create({
              model: "gpt-4o",
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: promptText },
                {
                  role: "user",
                  content: [
                    { type: "text", text: "استخرج 5 أسئلة متعددة الخيارات (QCM) دقيقة من صورة هذا الامتحان بدون تأليف خارج الورقة:" },
                    {
                      type: "image_url",
                      image_url: { url: a4ImageUrl, detail: "high" }
                    }
                  ]
                }
              ],
              temperature: 0.1,
              max_tokens: 2500,
            });
          } catch (err) {
            completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: promptText },
                {
                  role: "user",
                  content: [
                    { type: "text", text: "استخرج 5 أسئلة متعددة الخيارات (QCM) دقيقة من صورة هذا الامتحان بدون تأليف خارج الورقة:" },
                    {
                      type: "image_url",
                      image_url: { url: a4ImageUrl, detail: "high" }
                    }
                  ]
                }
              ],
              temperature: 0.1,
              max_tokens: 2500,
            });
          }

          const rawJson = completion.choices[0]?.message?.content || "{}";
          let parsed: any = {};
          try {
            parsed = JSON.parse(rawJson);
          } catch {
            const cleaned = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
            parsed = JSON.parse(cleaned);
          }

          const rawList = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.quiz || []);
          if (Array.isArray(rawList) && rawList.length > 0) {
            const pts = Number((maxScore / rawList.length).toFixed(1));
            const parsedQuestions = rawList.map((q: any, idx: number) => {
              let opts = Array.isArray(q.options) ? q.options.map(String) : [];
              while (opts.length < 4) {
                opts.push(`الخيار ${opts.length + 1}`);
              }
              return {
                id: q.id || `q_${idx + 1}`,
                question: String(q.question || `سؤال ${idx + 1}`),
                options: opts.slice(0, 4),
                correctAnswerIndex: typeof q.correctAnswerIndex === "number" && q.correctAnswerIndex >= 0 && q.correctAnswerIndex <= 3 ? q.correctAnswerIndex : 0,
                points: pts,
              };
            });

            await prisma.quiz.create({
              data: {
                examId: exam.id,
                aiGenerated: true,
                maxScore,
                questions: parsedQuestions,
              }
            });
          }
        }
      } catch (aiError) {
        console.error("OpenAI Quiz extraction failed:", aiError);
        // We do not block exam creation if AI fails
      }
    }

    revalidatePath("/dashboard/admin/exams");
    return { success: true, examId: exam.id };
  } catch (error: any) {
    console.error("createExam error:", error);
    return { error: error.message || "حدث خطأ غير متوقع" };
  }
}

export async function gradeStudentSubmission(formData: FormData) {
  try {
    const sessionUser = await assertAuth({ requireRole: "STUDENT" });
    const studentId = formData.get("studentId") as string;
    
    // Strict IDOR protection
    if (sessionUser.id !== studentId) {
      return { error: "IDOR Blocked: Cannot submit for another student" };
    }

    const examId = formData.get("examId") as string;
    const file = formData.get("file") as File;

    if (!studentId || !examId || !file) {
      return { error: "بيانات مفقودة تأكد من إرفاق صورة الحل" };
    }

    // 1. Fetch Exam and linked AI Quiz questions
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { quiz: true }
    });

    if (!exam) return { error: "الاختبار غير موجود" };

    // 2. Upload student submission to 'exams' bucket
    const fileUrl = await uploadToSupabase(file, "exams", `submission-${studentId}-${examId}`);
    const fileType = file.type;
    const imageUrl = fileType.startsWith("image/") ? fileUrl : null;

    // 3. Call AI Vision to Grade
    let score = 0;
    let feedback = "تم استلام الحل بنجاح سيتم تصحيحه قريباً";

    if (exam.quiz && exam.quiz.questions && imageUrl) {
      try {
        const questionsStr = JSON.stringify(exam.quiz.questions);
        const prompt = `أنت أستاذ ذكي تصحح ورقة التلميذ
إليك الأسئلة الخاصة بالاختبار:
${questionsStr}

المطلوب:
1. انظر إلى صورة حل التلميذ
2. قيّم إجابته وقارنها بالمنطق الصحيح
3. أعطه علامة من ${exam.maxScore}.
4. قم بإرجاع رد بصيغة JSON حصراً يحتوي على مفتاحين:
- "score": عدد صحيح يمثل العلامة
- "feedback": نص باللغة العربية يشرح ملاحظاتك على إجابته بأسلوب مشجع ومحترم
بدون أي نص إضافي أو markdown.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `أنت أستاذ ومصحح ذكي تصحح ورقة حل التلميذ للاختبار.
إليك أسئلة الاختبار:
${questionsStr}

المطلوب:
1. انظر إلى صورة حل التلميذ بعناية.
2. قيّم إجابته وقارنها بالحل الصحيح.
3. أعطه علامة مستحقة من ${exam.maxScore}.
4. قم بإرجاع رد بصيغة JSON حصراً يحتوي على:
{
  "score": عدد يمثل العلامة,
  "feedback": "ملاحظاتك التوجيهية باللغة العربية بأسلوب تربوي مشجع"
}`
            },
            {
              role: "user",
              content: [
                { type: "text", text: "قم بتصحيح ورقة إجابة التلميذ هذه:" },
                { type: "image_url", image_url: { url: imageUrl, detail: "high" } }
              ]
            }
          ],
          temperature: 0.2,
          max_tokens: 1500,
        });

        const rawJson = completion.choices[0]?.message?.content || "{}";
        const cleanedJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedJson);

        if (parsed.score !== undefined) score = Number(parsed.score);
        if (parsed.feedback) feedback = parsed.feedback;
      } catch (aiError) {
        console.error("AI grading failed:", aiError);
        feedback = "تعذر التصحيح التلقائي تم استلام ورقتك وسيقوم الأستاذ بمراجعتها";
      }
    }

    // 4. Save Submission
    await prisma.studentSubmission.upsert({
      where: {
        examId_studentId: { examId, studentId }
      },
      update: {
        imageUrl,
        fileUrl,
        fileType,
        score,
        feedback
      },
      create: {
        examId,
        studentId,
        imageUrl,
        fileUrl,
        fileType,
        score,
        feedback
      }
    });

    // 5. Update Student Profile totalPoints
    if (score > 0) {
      await prisma.studentProfile.update({
        where: { userId: studentId },
        data: {
          totalPoints: {
            increment: score
          }
        }
      });
    }

    revalidatePath("/dashboard/student/exams");
    return { success: true, score, feedback };
  } catch (error: any) {
    console.error("gradeStudentSubmission error:", error);
    return { error: error.message || "حدث خطأ غير متوقع أثناء إرسال الحل" };
  }
}
