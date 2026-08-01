import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('Seeding subjects...');

  const subjects = [
    { name: "الرياضيات", description: "الجبر، الهندسة، والدوال", teacherName: "الأستاذ دقيش علي", level: "الثانية ثانوي" },
    { name: "الفيزياء", description: "الميكانيك والكهرباء", teacherName: "الأستاذ دقيش علي", level: "الثانية ثانوي" },
    { name: "العلوم الطبيعية", description: "الخلية والـ DNA", teacherName: "الأستاذ دقيش علي", level: "الثانية ثانوي" },
    { name: "اللغة العربية", description: "الأدب والقواعد", teacherName: "الأستاذ دقيش علي", level: "الثانية ثانوي" },
  ];

  for (const subject of subjects) {
    await prisma.subject.create({
      data: subject,
    });
  }

  console.log('✅ Subjects seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
