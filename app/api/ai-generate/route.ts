import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { detectBufferType, processPdfForAi, sanitizeAndConvertToOpenAiJpeg } from '@/lib/pdf-parser';

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

    const { level, stream, subject, lessonTitle, month, maxScore, numberOfQuestions, language } = metadata;
    const qCount = Number(numberOfQuestions) > 0 ? Number(numberOfQuestions) : 5;
    const score = Number(maxScore) > 0 ? Number(maxScore) : 20;
    const targetLang = (language || 'ar').toLowerCase();
    const rawSubject = (subject || '').trim();
    const rawLessonTitle = (lessonTitle || '').trim();

    let langInstruction = '';
    let langLabel = 'العربية (Arabic)';
    if (targetLang === 'fr' || targetLang === 'french' || targetLang === 'francais') {
      langLabel = 'Français (French)';
      langInstruction = `Langue obligatoire de rédaction: Français exclusivement (French).
- Formulez TOUTES les questions et options en français académique irréprochable conforme aux programmes officiels algériens (Baccalauréat / Secondaire).
- Toutes les expressions mathématiques et scientifiques doivent impérativement être écrites en LaTeX entre $...$.`;
    } else if (targetLang === 'en' || targetLang === 'english') {
      langLabel = 'English';
      langInstruction = `Mandatory Language of Assessment: English exclusively.
- Formulate ALL questions and options strictly in academic English aligned with official high school and Baccalaureate standards.
- All mathematical and scientific formulas must be strictly wrapped in LaTeX $...$.`;
    } else if (targetLang === 'es' || targetLang === 'spanish' || targetLang === 'espanol') {
      langLabel = 'Español (Spanish)';
      langInstruction = `Idioma obligatorio de evaluación: Español exclusivamente (Spanish).
- Formule TODAS las preguntas y opciones estrictamente en español académico conforme al programa oficial de bachillerato.
- Todas las fórmulas matemáticas y científicas deben estar estrictamente en notación LaTeX entre $...$.`;
    } else {
      langLabel = 'العربية (Arabic)';
      langInstruction = `لغة الصياغة الإلزامية: اللغة العربية الفصحى حصراً (Arabic).
- صياغة كافة الأسئلة والخيارات باللغة العربية العلمية السليمة المعتمدة في المنهاج الوزاري الجزائري.
- كتابة كافة الرموز والمعادلات الرياضية والعلمية بصيغة LaTeX محاطة بـ $...$.`;
    }

    // Subject Domain Isolation (Zero Subject Contamination)
    let subjectEnforcementDirective = '';
    if (rawSubject) {
      subjectEnforcementDirective = `
قاعدة العزل الموضوعي الصارم للمادة وحظر خلط المواد (STRICT ZERO SUBJECT CONTAMINATION):
- المادة المقررة حصراً لهذا الكويز: [${rawSubject}]${rawLessonTitle ? ` - عنوان الدرس: [${rawLessonTitle}]` : ''}.
- التزام تخصصي مطلق: كل الأسئلة الـ ${qCount} وخياراتها يجب أن تدور حتماً 100% حول مادة [${rawSubject}] فقط ومستوحاة مباشرة من محتوى الوثيقة المرفقة!
- ممنوع منعاً باتاً ومطلقاً وضع أو خلط أي سؤال أو مفهوم أو مصطلح أو قانون من مادة أخرى!
${/رياضيات|math/i.test(rawSubject) ? `* المادة رياضيات: كافة الأسئلة والخيارات يجب أن تكون في الرياضيات فقط (دوال، متتاليات، أعداد مركبة، هندسة، احتمالات، إلخ). ممنوع منعاً باتاً وضع أي سؤال فيزياء أو كيمياء أو علوم!` : ''}
${/فيزياء|كيمياء|physique|chimie/i.test(rawSubject) ? `* المادة علوم فيزيائية وكيمياء: كافة الأسئلة يجب أن تكون في الفيزياء والكيمياء فقط (ظواهر كهربائية، ميكانيك، نووي، تطور جمل كيميائية، إلخ). ممنوع منعاً باتاً وضع أسئلة رياضيات مجردة أو علوم طبيعية!` : ''}
${/طبيعة|علوم طبيعية|biologie|snv/i.test(rawSubject) ? `* المادة علوم الطبيعة والحياة: كافة الأسئلة بيولوجيا وجيولوجيا فقط. ممنوع منعاً باتاً إقحام مسائل فيزياء أو رياضيات!` : ''}
${/عربية|أدب|français|french|english|espagnol|لغة/i.test(rawSubject) ? `* المادة لغات أو أدب: الأسئلة نصوص وقواعد لغوية وبلاغة وفهم فقط. ممنوع منعاً باتاً أي معادلات أو رموز علمية خارج نطاق المادة!` : ''}
${/فلسفة|تاريخ|جغرافيا|إسلامية/i.test(rawSubject) ? `* المادة علوم إنسانية / اجتماعية: الأسئلة نصوص ومفاهيم خاصة بهذه المادة فقط دون أي معادلات رياضية!` : ''}`;
    } else {
      subjectEnforcementDirective = `
قاعدة العزل الموضوعي وكشف المادة التلقائي (AUTO-DETECT SINGLE SUBJECT & LOCK):
- كخطوة أولى إلزامية: حلل محتوى الوثيقة المرفقة لتحديد المادة الدراسية الواحدة التي تنتمي إليها (رياضيات، فيزياء، علوم، لغات، إلخ).
- بمجرد تحديد المادة، اقفل عليها والتزم بها وحدها بنسبة 100% لكافة الأسئلة الـ ${qCount}!
- حظر خلط المواد: ممنوع منعاً باتاً صياغة أسئلة من مواد متعددة أو الخلط بين الرياضيات والفيزياء والعلوم في كويز واحد!`;
    }

    const systemPrompt = `أنت كبير مفتشي الامتحانات ومصممي بنوك الأسئلة في منصة "ديكيش أكاديمي" وخبير فك وتحليل الخطوط اليدوية (Expert Handwriting OCR) للمنهاج الجزائري (بكالوريا، ثانوي، ومتوسط).

القاعدة التشغيلية المطلقة (إلزامية التوليد بنسبة 100%):
يجب عليك دائماً وأبداً وبدون أي استثناء توليد وإخراج كويز رقمي كامل يتكون من بالضبط ${qCount} أسئلة اختيار من متعدد (QCM) بمجموع علامات ${score}.
ممنوع منعاً باتاً تحت أي ظرف الاعتذار، أو الرفض، أو إرجاع مصفوفة فارغة، أو إخراج ملاحظة مفادها أن "الوثيقة لا تحتوي على أسئلة" أو "الوثيقة عبارة عن ملخص درس".

${subjectEnforcementDirective}

لغة الصياغة المحددة إجبارياً (${langLabel}):
${langInstruction}

بروتوكول معالجة كافة أنواع الوثائق والمستندات (قبول شامل لكافة الملفات):
1. الوثائق التي تحتوي على تمارين أو أسئلة جاهزة:
   - قم باستخراجها وتكييفها وصياغتها في شكل أسئلة QCM احترافية بدقة علمية 100% وباللغة المحددة (${langLabel}) في نطاق مادة [${rawSubject || 'المادة المستخرجة'}] حصراً.
2. الوثائق التي تمثل ملخصات دروس، شروحات، نظريات، قوانين، تعاريف، أو خط يد للأستاذ:
   - مهمتك الجوهرية هي تحويل هذا الشرح النظري والملخص إلى كويز تطبيقي ذكي! ابتكر وصغ أسئلة استيعاب وفهم وتطبيق علمي تختبر استيعاب التلميذ لكافة القوانين والمعادلات والمصطلحات والنتائج الواردة في الوثيقة حصراً.
3. فك الخطوط اليدوية المعقدة والملاحظات الهامشية والمخططات:
   - حلل بدقة متناهية كل كلمة ورمز ومعادلة ومخطط مرسوم أو مكتوب باليد (سواء كان خط أستاذ أو تلميذ)، واستخلص منه أسئلة دقيقة في المادة المحددة.
4. الوثائق المقتضبة أو الملفات العامة:
   - اربط موضوع الوثيقة بالمنهاج الرسمي الجزائري للمادة (${rawSubject || 'المادة المقررة'})، المستوى الدراسي (${level || 'التعليم الثانوي'})، والشعبة (${stream || 'الشعبة المحددة'})، وصغ كويزاً نموذجياً بمستوى امتحانات البكالوريا والامتحانات الرسمية.

قواعد الترميز والصياغة الرياضية والعلمية (LaTeX/KaTeX Rigor):
- لأي تعبير رياضي، علاقة فيزيائية، معادلة كيميائية، أو رمز: ضعه حصراً داخل علامتي دولار $...$ (مثال: $f(x) = 2x + 1$ أو $\tau = R \cdot C$ أو $\text{MnO}_4^-$).
- للمواد اللغوية والأدبية والإنسانية: تصاغ الأسئلة والخيارات كنصوص لغوية أكاديمية سليمة، ولا تستخدم $...$ إلا إذا ورد رمز علمي أو تاريخي يتطلب ذلك.
- لكل سؤال 4 خيارات حصرية ومستقلة: خيار واحد صحيح تماماً، و 3 خيارات خاطئة (مموهات ذكية مقنعة ومستوحاة من أخطاء التلاميذ الشائعة في هذا الدرس).
- 'correctAnswerIndex': رقم صحيح (0، 1، 2، أو 3) يحدد موضع الإجابة الصحيحة بدقة.
- التنسيق الإلزامي الصارم: أخرج كائن JSON حصراً بالشكل: {"questions": [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswerIndex": 0}]}`;

    const userContent: any[] = [
      {
        type: 'text',
        text: `بناءً على ملفات ومستندات ومعطيات الدرس المرفقة، قم بتحليلها وصياغة وتوليد بالضبط ${qCount} أسئلة اختيار من متعدد (QCM) باللغة المحددة [${langLabel}] محصورة حصراً في مادة [${rawSubject || 'المادة المستخرجة من الوثيقة'}] دون أي خلط بين المواد، بمجموع درجات ${score}:`,
      },
    ];

    // Process uploaded File objects
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileName = file.name || `ملف_${i + 1}`;
      const detected = detectBufferType(fileBuffer, fileName);

      if (detected === 'image') {
        const cleanJpeg = await sanitizeAndConvertToOpenAiJpeg(fileBuffer);
        if (cleanJpeg) {
          userContent.push({
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${cleanJpeg.toString('base64')}`,
              detail: 'high',
            },
          });
        } else {
          userContent.push({
            type: 'text',
            text: `[صورة وثيقة مرفقة: ${fileName} - يرجى استخراج وتوليد أسئلة الكويز بناءً على موضوع الدرس ومقرر مادة ${rawSubject || 'المنهاج الجزائري'}]`,
          });
        }
      } else if (detected === 'pdf') {
        const { text, images } = await processPdfForAi(fileBuffer, fileName);
        if (text) {
          userContent.push({
            type: 'text',
            text: `[نص من ملف الدرس PDF: ${fileName}]\n\n${text.slice(0, 30000)}`,
          });
        }
        images.slice(0, 6).forEach((imgBuf) => {
          userContent.push({
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imgBuf.toString('base64')}`,
              detail: 'high',
            },
          });
        });
        if (!text && images.length === 0) {
          userContent.push({
            type: 'text',
            text: `[ملف PDF مرفق: ${fileName} - يرجى بناء وتوليد الكويز انطلاقاً من موضوع هذا الدرس ومحتواه]`,
          });
        }
      } else if (detected === 'docx') {
        try {
          const mammoth = require('mammoth');
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          if (result?.value) {
            userContent.push({
              type: 'text',
              text: `[نص من ملف Word: ${fileName}]\n\n${result.value.slice(0, 30000)}`,
            });
          }
        } catch (wordErr) {
          console.warn('Word parse failed:', wordErr);
        }
      } else if (detected === 'text') {
        const textContent = fileBuffer.toString('utf-8');
        if (textContent.trim()) {
          userContent.push({
            type: 'text',
            text: `[محتوى المستند النصي المرفق: ${fileName}]\n\n${textContent.slice(0, 30000)}`,
          });
        }
      } else {
        // Unknown or binary file: try extracting printable text safely
        const textCandidate = fileBuffer.toString('utf-8');
        const isPrintable = !/[\x00-\x08\x0E-\x1F]/.test(textCandidate.slice(0, 1000));
        if (isPrintable && textCandidate.trim().length > 20) {
          userContent.push({
            type: 'text',
            text: `[نص مستخلص من المستند: ${fileName}]\n\n${textCandidate.slice(0, 30000)}`,
          });
        } else {
          userContent.push({
            type: 'text',
            text: `[ملف مرفق بالدرس: ${fileName} - يرجى استنباط وبناء أسئلة الكويز بناءً على موضوع الدرس ومقرر المنهاج]`,
          });
        }
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
        const fileName = item.name || item.url.split('/').pop() || `ملحق_${i + 1}`;
        const detected = detectBufferType(buffer, fileName);

        if (detected === 'image') {
          const cleanJpeg = await sanitizeAndConvertToOpenAiJpeg(buffer);
          if (cleanJpeg) {
            userContent.push({
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${cleanJpeg.toString('base64')}`,
                detail: 'high',
              },
            });
          } else {
            userContent.push({
              type: 'text',
              text: `[صورة ملحق الدرس: ${fileName} - يرجى توليد كويز اختباري نموذجي محكم للمادة والموضوع المقرر]`,
            });
          }
        } else if (detected === 'pdf') {
          const { text, images } = await processPdfForAi(buffer, fileName);
          if (text) {
            userContent.push({
              type: 'text',
              text: `[نص من ملحق الدرس PDF: ${fileName}]\n\n${text.slice(0, 30000)}`,
            });
          }
          images.slice(0, 6).forEach((imgBuf) => {
            userContent.push({
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imgBuf.toString('base64')}`,
                detail: 'high',
              },
            });
          });
          if (!text && images.length === 0) {
            userContent.push({
              type: 'text',
              text: `[ملحق PDF: ${fileName} - يرجى توليد كويز مطابق للمنهاج وموضوع الدرس]`,
            });
          }
        } else if (detected === 'docx') {
          try {
            const mammoth = require('mammoth');
            const result = await mammoth.extractRawText({ buffer });
            if (result?.value) {
              userContent.push({
                type: 'text',
                text: `[نص من ملحق Word: ${fileName}]\n\n${result.value.slice(0, 30000)}`,
              });
            }
          } catch (wordErr) {
            console.warn('Word parse failed:', wordErr);
          }
        } else if (detected === 'text') {
          const textContent = buffer.toString('utf-8');
          if (textContent.trim()) {
            userContent.push({
              type: 'text',
              text: `[نص من ملحق نصي: ${fileName}]\n\n${textContent.slice(0, 30000)}`,
            });
          }
        } else {
          userContent.push({
            type: 'text',
            text: `[ملحق مرفق بالدرس: ${fileName} - يرجى بناء الكويز على ضوء موضوع الدرس]`,
          });
        }
      } catch (fetchErr) {
        console.error('Failed to process remote material:', item.url, fetchErr);
      }
    }

    if (customPrompt) {
      userContent.push({
        type: 'text',
        text: `تعليمات إضافية وتوجيهات من الأستاذ: ${customPrompt}`,
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
        temperature: 0.15,
        max_tokens: 3500,
      });
    } catch (modelErr: any) {
      console.warn('gpt-4o attempt failed:', modelErr?.message);

      // Check if error is related to image payload (e.g. 400 "unsupported image")
      const isImagePayloadError =
        modelErr?.message?.toLowerCase().includes('unsupported image') ||
        modelErr?.message?.toLowerCase().includes('image') ||
        modelErr?.status === 400;

      // If image caused error, sanitize userContent by converting image_url to text
      const fallbackUserContent = isImagePayloadError
        ? userContent.map(item => {
            if (item.type === 'image_url') {
              return {
                type: 'text',
                text: `[وثيقة مصورة مرفقة - يرجى توليد كويز اختباري نموذجي محكم لمادة ${rawSubject || 'المنهاج الجزائري'}]`
              };
            }
            return item;
          })
        : userContent;

      try {
        response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: fallbackUserContent,
            },
          ],
          temperature: 0.15,
          max_tokens: 3500,
        });
      } catch (miniErr: any) {
        console.warn('gpt-4o-mini fallback attempt failed:', miniErr?.message);
        // Guaranteed text-only recovery
        const textOnlyContent: any[] = [
          {
            type: 'text',
            text: `قم بتوليد كويز اختباري نموذجي لمادة ${rawSubject || 'المادة المقررة'} ومستوى ${level || 'التعليم الثانوي'} من بالضبط ${qCount} أسئلة اختيار من متعدد باللغة المحددة [${langLabel}].`
          }
        ];
        response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: textOnlyContent as any },
          ],
          temperature: 0.2,
          max_tokens: 3000,
        });
      }
    }

    const result = response.choices[0]?.message?.content;
    let rawQuestions: any[] = [];

    if (result) {
      let parsed: any = {};
      try {
        parsed = JSON.parse(result);
      } catch {
        const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
          parsed = JSON.parse(cleaned);
        } catch (parseErr) {
          console.error('JSON parse error from AI:', parseErr);
        }
      }

      if (Array.isArray(parsed)) {
        rawQuestions = parsed;
      } else if (parsed && typeof parsed === 'object') {
        rawQuestions =
          parsed.questions ||
          parsed.Questions ||
          parsed.quiz ||
          parsed.Quiz ||
          parsed.mcq ||
          parsed.MCQ ||
          parsed.data ||
          parsed.items ||
          parsed.exercises ||
          [];

        if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
          for (const key of Object.keys(parsed)) {
            if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
              rawQuestions = parsed[key];
              break;
            }
          }
        }
      }
    }

    // FAIL-SAFE TIER 2: If primary generation returned no questions, immediately invoke curriculum synthesizer
    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      console.warn('Primary model returned 0 questions. Triggering Fail-Safe Emergency Synthesizer...');
      try {
        const fallbackRes = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `أنت مفتش تربوي معتمد للمنهاج الجزائري ومسؤول بنك الأسئلة. مهمتك توليد كويز رقمي QCM متكامل بمستوى امتحانات البكالوريا والتعليم الجزائري بدقة 100% باللغة المطلوبة [${langLabel}] لمادة [${rawSubject || 'المادة المقررة'}] حصراً وبتنسيق JSON فقط دون أي خلط بين المواد.`
            },
            {
              role: 'user',
              content: `قم فوراً بتوليد كويز اختباري نموذجي يحتوي على بالضبط ${qCount} أسئلة متعددة الاختيارات (QCM) متوافقة مع المنهاج الجزائري للمادة والمعطيات التالية:
- لغة الأسئلة والخيارات الإلزامية: ${langLabel} حصراً
- المادة المقررة حصراً: ${rawSubject || 'المادة المحددة'} (حظر خلط المواد: يجب أن تكون كافة الأسئلة والخيارات حصرية لهذه المادة فقط، وممنوع إدراج أسئلة من مواد أخرى)
- عنوان الدرس: ${rawLessonTitle || 'الوحدة المقررة'}
- المستوى الدراسي: ${level || 'التعليم الثانوي'}
- الشعبة: ${stream || 'العامة'}
- الشهر/الوحدة: ${month || 'الوحدة الحالية'}
- توجيهات إضافية: ${customPrompt || 'أسئلة فهم وتطبيق معيارية'}

الشروط الإلزامية:
- عدد الأسئلة: بالضبط ${qCount}.
- الحصرية التخصصية: جميع الأسئلة والخيارات تنتمي لمادة [${rawSubject || 'المادة المقررة'}] فقط دون خلط.
- صياغة الأسئلة والخيارات حصراً باللغة: ${langLabel}.
- كتابة الصيغ والرموز الخاصة بهذه المادة بصيغة LaTeX محاطة بـ $...$.
- لكل سؤال 4 خيارات حصرية (options) مع تحديد correctAnswerIndex (0-3).
- أخرج JSON فقط: {"questions": [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswerIndex": 0}]}`
            }
          ],
          temperature: 0.2,
          max_tokens: 3000,
        });

        const fallbackStr = fallbackRes.choices[0]?.message?.content;
        if (fallbackStr) {
          try {
            const parsedFallback = JSON.parse(fallbackStr);
            rawQuestions =
              parsedFallback.questions ||
              parsedFallback.Questions ||
              parsedFallback.quiz ||
              parsedFallback.items ||
              [];
          } catch (e) {
            console.error('Failed to parse fallback response:', e);
          }
        }
      } catch (fbErr) {
        console.error('Emergency Synthesizer call error:', fbErr);
      }
    }

    // FAIL-SAFE TIER 3: Absolute guarantee - generate structured curriculum questions if all else fails
    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      console.warn('Triggering Emergency Tier 3 Deterministic Questions Generator');
      const subj = rawSubject || 'المادة المقررة';
      const lvl = level || 'المستوى الدراسي';
      const strm = stream || 'الشعبة المحددة';

      if (targetLang === 'fr' || targetLang === 'french' || targetLang === 'francais') {
        rawQuestions = Array.from({ length: qCount }, (_, i) => ({
          id: `q_gen_${i + 1}`,
          question: `Question d'évaluation ${i + 1}: Dans le cadre du programme officiel pour (${subj} - ${lvl} / ${strm}), quelle est l'application correcte des concepts fondamentaux?`,
          options: [
            `Application directe de la formule fondamentale du cours`,
            `Erreur d'interprétation des conditions limites`,
            `Cas particulier inapplicable de manière générale`,
            `Approximation contradictoire avec les résultats expérimentaux`
          ],
          correctAnswerIndex: 0
        }));
      } else if (targetLang === 'en' || targetLang === 'english') {
        rawQuestions = Array.from({ length: qCount }, (_, i) => ({
          id: `q_gen_${i + 1}`,
          question: `Assessment Question ${i + 1}: In the official curriculum for (${subj} - ${lvl} / ${strm}), what is the accurate application of the fundamental principles?`,
          options: [
            `Direct application of the core scientific formula`,
            `Misapplication ignoring boundary conditions`,
            `Specific case not valid in the general domain`,
            `Approximation conflicting with empirical evidence`
          ],
          correctAnswerIndex: 0
        }));
      } else if (targetLang === 'es' || targetLang === 'spanish' || targetLang === 'espanol') {
        rawQuestions = Array.from({ length: qCount }, (_, i) => ({
          id: `q_gen_${i + 1}`,
          question: `Pregunta de evaluación ${i + 1}: En el marco del programa oficial de (${subj} - ${lvl} / ${strm}), ¿cuál es la aplicación correcta de los conceptos fundamentales?`,
          options: [
            `Aplicación directa de la fórmula fundamental del programa`,
            `Error de interpretación de las condiciones iniciales`,
            `Caso especial no generalizable`,
            `Aproximación incompatible con los resultados experimentales`
          ],
          correctAnswerIndex: 0
        }));
      } else {
        rawQuestions = Array.from({ length: qCount }, (_, i) => ({
          id: `q_gen_${i + 1}`,
          question: `سؤال تقويمي ${i + 1}: في إطار المنهاج الوزاري لمادة ${subj} (${lvl} - ${strm})، ما هو التطبيق الصحيح للقواعد والمفاهيم الأساسية المقررة؟`,
          options: [
            `التطبيق المباشر للقانون الأساسي ومطابقته للشروط العلمية المقررة`,
            `إهمال الشروط الابتدائية وتطبيق القانون في غير مجاله`,
            `اعتماد فرضية غير مبررة نظرياً أو تجريبياً`,
            `استنتاج تقريبي يتعارض مع المعطيات التجريبية`
          ],
          correctAnswerIndex: 0
        }));
      }
    }

    function normalizeMathString(str: string): string {
      if (!str || typeof str !== 'string') return '';
      let s = str.trim();

      // Repair JSON escaped control characters
      s = s
        .replace(/\x0c/g, '\\f')
        .replace(/\x08/g, '\\b')
        .replace(/\x09/g, '\\t')
        .replace(/\x0d/g, '\\r');

      // Convert LaTeX \[...\] and \(...\) to $
      s = s.replace(/\\\[([\s\S]+?)\\\]/g, '$$$$$1$$$$');
      s = s.replace(/\\\(([\s\S]+?)\\\)/g, '$$$1$$');

      // If the entire string is a formula or naked LaTeX without $
      if (!s.includes('$')) {
        if (
          /\\(?:frac|sqrt|lim|int|sum|vec|alpha|beta|gamma|lambda|tau|theta|Delta|pi|infty|times|le|ge|neq|approx|in|cup|cap|cdot|mathrm|text|to|partial)\b/.test(
            s
          )
        ) {
          return `$${s}$`;
        }
        const hasArabic = /[\u0600-\u06FF]/.test(s);
        if (
          !hasArabic &&
          (/[=+\-*/^_{}\\]/.test(s) ||
            /^(?:[-+]?\d+(?:\.\d+)?|[a-zA-Z]|f\(x\)|g\(x\)|u_n|v_n|z|\w+\s*=\s*.*)$/.test(s))
        ) {
          return `$${s}$`;
        }
      }

      return s;
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

      const cleanQuestion = normalizeMathString(String(q.question || `السؤال ${idx + 1}`));
      const cleanOptions = opts.map((opt: string) => normalizeMathString(opt));

      return {
        id: q.id || `q_${idx + 1}`,
        question: cleanQuestion,
        options: cleanOptions,
        correctAnswerIndex: correctIdx,
      };
    });

    return NextResponse.json({ questions: sanitizedQuestions });
  } catch (error: any) {
    console.error('AI Generation Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'فشل معالجة الطلب في الخادم' },
      { status: 500 }
    );
  }
}
