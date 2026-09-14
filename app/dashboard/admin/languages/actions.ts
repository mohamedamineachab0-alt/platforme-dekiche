"use server";

import { setSubjectPublished } from "@/actions/subjects";

export async function toggleLanguageSubjectPublished(formData: FormData) {
  const subjectId = formData.get("subjectId") as string;
  const next = formData.get("next") === "true";
  if (!subjectId) return;
  await setSubjectPublished(subjectId, next);
}
