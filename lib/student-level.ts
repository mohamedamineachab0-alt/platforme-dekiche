import type { UnderstandingLevel } from "@/generated/prisma";

export const UNDERSTANDING_LABELS: Record<UnderstandingLevel, string> = {
  FAST: "فهم سريع",
  AVERAGE: "متوسط",
  WEAK: "ضعيف",
};

export function understandingTeacherStyle(_level?: UnderstandingLevel | null): string {
  return `مستوى فهم كل التلاميذ: ضعيف ويحتاج دعماً أكبر.
- لغة أبسط وجمل قصيرة.
- اشرح الخطوة ثم التي تليها.
- التلميحات مفصّلة دون كشف الإجابة.
- أكثر من الأمثلة المشابهة للمنهاج.
- لا تفترض أن التلميذ يعرف المصطلح قبل شرحه.`;
}
