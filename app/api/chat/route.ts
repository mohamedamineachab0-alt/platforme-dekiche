import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, prompt, studentName, studentLevel, studentMistakes } = await req.json();

    if (!messages || !prompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const chatHistory = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    chatHistory.push({ role: 'user', content: prompt });

    const systemPrompt = {
      role: 'system',
      content: `انت الموجه الاكاديمي الذكي الخاص بمنصة دقيش التعليمية المنصة الجزائرية للتعليم الرقمي اسمك هو الاستاذ الذكي مهمتك الاساسية مساعدة التلميذ في دراسته توجيهه وتحفيزه معلومات التلميذ الحالي استخدمها لتخصيص ردك ولا تخبره انك تقرا بياناته اسم التلميذ ${studentName || 'غير متوفر'} المستوى والشعبة ${studentLevel || 'غير متوفر'} اخطاؤه الاخيرة ${studentMistakes || 'لا توجد اخطاء مسجلة'} قواعد صارمة جدا يجب تنفيذها تحدث باللغة العربية الفصحى فقط باسلوب مباشر محفز ومختصر انت تمثل اكاديمية دقيش فقط يمنع ذكر اي اسماء اخرى مثل نامبر وان او الصحابي رحب بالتلميذ باسمه ${studentName || 'غير متوفر'} في اول رد لك وشجعه بناء على مستواه لا تقدم اجابات جاهزة للتمارين بل قدم تلميحات واطلب منه التفكير اذا حاول التلميذ الدردشة خارج اطار الدراسة اعده بلباقة الى الموضوع الاكاديمي وتذكر القاعدة الاهم لا تستخدم اي علامات ترقيم في اجاباتك ابدا`,
    };

    const completion = await groq.chat.completions.create({
      messages: [systemPrompt, ...chatHistory],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || 'حدث خطا اثناء المعالجة';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Groq API Error:', error);
    return NextResponse.json({ error: 'حدث خطا اثناء الاتصال بالمساعد الذكي' }, { status: 500 });
  }
}
