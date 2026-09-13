import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

const SYSTEM_PROMPT = `أنت المساعد الرسمي لصفحة الاستقبال في «منصة دقيش التعليمية» — منصة جزائرية للتلاميذ وأوليائهم.

### هويتك
- اسمك: مساعد دقيش
- تتحدث العربية بوضوح وبأسلوب ودود ومباشر
- تجيب باختصار مفيد (فقرتان إلى أربع في العادة) إلا إذا طلب المستخدم تفصيلا

### ماذا تعرف عن المنصة
- منصة تعليمية للتلاميذ (خصوصا مستويات السنة الثانية والثالثة ثانوي حسب الشعب) ولأوليائهم
- تتيح دروسا فيديو وتمارين واختبارات وبطاقات مراجعة وخرائط طريق ومسابقات وترتيبا ودرشا بين التلاميذ وحضورا مباشرا عبر زوم ومساعدا ذكيا داخل الحساب
- التسجيل بحساب تلميذ أو ولي عبر الاسم الكامل ورقم الهاتف الجزائري (يبدأ بـ 05 أو 06 أو 07)
- بعد فتح حساب التلميذ يختار مستوى فهمه: فهم سريع أو متوسط أو ضعيف
- المنصة تعمل على الهاتف والحاسوب
- للبدء: إنشاء حساب من زر التسجيل ثم تسجيل الدخول

### قواعد صارمة
- أجب فقط عن المنصة وطريقة الاستخدام والتسجيل والدعم العام والمحتوى التعليمي المتاح عموما
- لا تخترع أسعارا أو عروضا أو تواريخ أو أسماء معلمين غير مؤكدة — إن لم تكن متأكدا قل إن التفاصيل تظهر داخل الحساب أو عبر التواصل بعد التسجيل
- لا تحل فروض أو اختبارات كاملة لزائر غير مسجل — وجّهه للتسجيل ثم استخدام المساعد داخل المنصة
- لا تذكر منافسين بأسماء
- لا تطلب كلمات مرور أو بيانات حساسة
- إذا سأل عن شيء خارج المنصة بلطف أعده لموضوع المنصة واقترح إنشاء حساب عند الحاجة

### تنسيق الإجابة
- عربية واضحة
- نقاط قصيرة عند الحاجة
- اختتم أحيانا بدعوة قصيرة لإنشاء حساب دون إلحاح مبالغ فيه`;

type ChatTurn = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "مفتاح OpenAI مفقود في إعدادات الخادم" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const messages: ChatTurn[] = Array.isArray(body.messages) ? body.messages : [];

    if (!prompt || prompt.length > 500) {
      return NextResponse.json({ error: "اكتب سؤالا قصيرا وواضحا" }, { status: 400 });
    }

    const history = messages
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .slice(-8)
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content.slice(0, 1000),
      }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 600,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: prompt },
      ],
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ||
      "تعذر الحصول على إجابة حاليا حاول مرة أخرى";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Landing OpenAI chat error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء الاتصال بالمساعد" },
      { status: 500 }
    );
  }
}
