import { stripArabicPunctuation } from "@/lib/arabic-text";

export type SeedFlashcard = {
  frontText: string;
  backText: string;
};

export type SeedExercise = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export function normalizeSeedFlashcards(raw: unknown): SeedFlashcard[] {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((item) => {
      const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      return {
        frontText: stripArabicPunctuation(String(row.frontText || row.front || "")),
        backText: stripArabicPunctuation(String(row.backText || row.back || "")),
      };
    })
    .filter((c) => c.frontText && c.backText);
}

export function normalizeSeedExercises(raw: unknown): SeedExercise[] {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((item) => {
      const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      const options = Array.isArray(row.options)
        ? row.options.map((o) => stripArabicPunctuation(String(o || ""))).filter(Boolean)
        : [];
      const correctAnswer = stripArabicPunctuation(String(row.correctAnswer || row.answer || ""));
      return {
        question: stripArabicPunctuation(String(row.question || "")),
        options: options.slice(0, 4),
        correctAnswer,
        explanation: stripArabicPunctuation(String(row.explanation || "")),
      };
    })
    .filter(
      (e) =>
        e.question &&
        e.options.length >= 2 &&
        e.correctAnswer &&
        e.options.includes(e.correctAnswer)
    );
}

/** Deterministic day index for rotating daily quests (Africa/Algiers) */
export function algeriaDayIndex(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Algiers",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value || "0";
  const m = parts.find((p) => p.type === "month")?.value || "0";
  const d = parts.find((p) => p.type === "day")?.value || "0";
  return Number(`${y}${m}${d}`);
}
