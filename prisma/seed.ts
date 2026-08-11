import { Role } from '../generated/prisma';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function main() {
  const passwordHash = await bcrypt.hash('123456', 12);

  // 1 حساب الأدمين
  const admin = await prisma.user.upsert({
    where: { phoneNumber: '07777777777' },
    update: {
      passwordHash,
      role: Role.ADMIN,
      fullName: 'عشاب محمد',
    },
    create: {
      phoneNumber: '07777777777',
      fullName: 'عشاب محمد',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // 2 حساب الأستاذ
  const teacherUser = await prisma.user.upsert({
    where: { phoneNumber: '0663438000' },
    update: {
      passwordHash,
      role: Role.TEACHER,
      fullName: 'عشاب عبد القادر',
    },
    create: {
      phoneNumber: '0663438000',
      fullName: 'عشاب عبد القادر',
      passwordHash,
      role: Role.TEACHER,
    },
  });

  await prisma.teacher.upsert({
    where: { phone: '0663438000' },
    update: {
      userId: teacherUser.id,
      name: 'عشاب عبد القادر',
    },
    create: {
      phone: '0663438000',
      name: 'عشاب عبد القادر',
      userId: teacherUser.id,
    },
  });

  // 3 حساب الولي
  const parentUser = await prisma.user.upsert({
    where: { phoneNumber: '0663438003' },
    update: {
      passwordHash,
      role: Role.PARENT,
      fullName: 'عشاب ضياء الدين',
    },
    create: {
      phoneNumber: '0663438003',
      fullName: 'عشاب ضياء الدين',
      passwordHash,
      role: Role.PARENT,
      parentProfile: {
        create: {}
      }
    },
  });

  console.log('تم إنشاء حساب الأدمين بنجاح');
  console.log('تم إنشاء حساب الأستاذ بنجاح');
  console.log('تم إنشاء حساب الولي بنجاح');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
