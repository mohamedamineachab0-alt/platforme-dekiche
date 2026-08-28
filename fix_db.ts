import { prisma } from './lib/prisma';

async function main() {
  const lessons = await prisma.lesson.findMany();
  for (const lesson of lessons) {
    if (lesson.subjectIds && lesson.subjectIds.length > 1) {
       await prisma.lesson.update({
         where: { id: lesson.id },
         data: {
           subjectIds: [lesson.subjectId]
         }
       });
       console.log(`Fixed lesson ${lesson.id}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
