"use server";

import { prisma } from '../../lib/prisma';

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "STUDENT" | "GUARDIAN";
  
  // Student fields
  const level = formData.get("level") as string | null;
  const track = formData.get("track") as string | null;
  const wilayaCode = formData.get("wilayaCode") as string | null;

  try {
    let wilayaId = null;
    if (wilayaCode) {
      const wilaya = await prisma.wilaya.findUnique({
        where: { code: wilayaCode },
      });
      if (wilaya) wilayaId = wilaya.id;
    }

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password, // Note: In a real app, hash this password before saving!
        role,
        level: role === "STUDENT" ? level : null,
        track: role === "STUDENT" ? track : null,
        wilayaId: role === "STUDENT" ? wilayaId : null,
      },
    });

    return { success: true, userId: user.id };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: error?.message || "Failed to register user." };
  }
}
