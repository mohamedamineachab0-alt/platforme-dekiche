/**
 * Seed weekly Zoom live schedule (39 sessions).
 * Run: npm run seed:live-sessions
 * Also invoked from prisma/seed.ts
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";

const SESSIONS: {
  level: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
}[] = [
  { level: "3 علمي + تقني", day: "الأحد", startTime: "18:00", endTime: "19:30", subject: "هندسة مدنية" },
  { level: "3 علمي + تقني", day: "الأحد", startTime: "20:00", endTime: "22:00", subject: "رياضيات" },
  { level: "3 علمي + تقني", day: "الاثنين", startTime: "18:00", endTime: "19:30", subject: "انجليزية" },
  { level: "3 علمي + تقني", day: "الاثنين", startTime: "20:00", endTime: "22:00", subject: "علوم طبيعية" },
  { level: "3 علمي + تقني", day: "الثلاثاء", startTime: "18:00", endTime: "19:30", subject: "اجتماعيات" },
  { level: "3 علمي + تقني", day: "الثلاثاء", startTime: "20:00", endTime: "22:00", subject: "فيزياء" },
  { level: "3 علمي + تقني", day: "الأربعاء", startTime: "18:00", endTime: "19:30", subject: "فرنسية" },
  { level: "3 علمي + تقني", day: "الأربعاء", startTime: "20:00", endTime: "22:00", subject: "علوم طبيعية" },
  { level: "3 علمي + تقني", day: "الخميس", startTime: "18:00", endTime: "19:30", subject: "رياضيات" },
  { level: "3 علمي + تقني", day: "الخميس", startTime: "20:00", endTime: "22:00", subject: "اللغة العربية" },
  { level: "3 علمي + تقني", day: "الجمعة", startTime: "20:00", endTime: "22:00", subject: "فيزياء" },
  { level: "3 علمي + تقني", day: "السبت", startTime: "20:00", endTime: "22:00", subject: "فلسفة" },

  { level: "2 علمي + تقني", day: "الأحد", startTime: "18:00", endTime: "19:30", subject: "فرنسية" },
  { level: "2 علمي + تقني", day: "الأحد", startTime: "20:00", endTime: "22:00", subject: "فيزياء" },
  { level: "2 علمي + تقني", day: "الاثنين", startTime: "20:00", endTime: "22:00", subject: "رياضيات" },
  { level: "2 علمي + تقني", day: "الثلاثاء", startTime: "18:00", endTime: "19:30", subject: "انجليزية" },
  { level: "2 علمي + تقني", day: "الثلاثاء", startTime: "20:00", endTime: "22:00", subject: "هندسة مدنية" },
  { level: "2 علمي + تقني", day: "الأربعاء", startTime: "18:00", endTime: "19:30", subject: "رياضيات" },
  { level: "2 علمي + تقني", day: "الخميس", startTime: "20:00", endTime: "22:00", subject: "فيزياء" },
  { level: "2 علمي + تقني", day: "الجمعة", startTime: "20:00", endTime: "22:00", subject: "علوم" },
  { level: "2 علمي + تقني", day: "السبت", startTime: "20:00", endTime: "22:00", subject: "لغة عربية" },

  { level: "3 أدب + لغات", day: "الأحد", startTime: "20:00", endTime: "22:00", subject: "لغة عربية" },
  { level: "3 أدب + لغات", day: "الاثنين", startTime: "18:00", endTime: "19:30", subject: "اجتماعيات" },
  { level: "3 أدب + لغات", day: "الاثنين", startTime: "20:00", endTime: "22:00", subject: "فلسفة" },
  { level: "3 أدب + لغات", day: "الثلاثاء", startTime: "20:00", endTime: "22:00", subject: "فلسفة" },
  { level: "3 أدب + لغات", day: "الأربعاء", startTime: "20:00", endTime: "22:00", subject: "اسبانية" },
  { level: "3 أدب + لغات", day: "الخميس", startTime: "18:00", endTime: "19:30", subject: "لغة عربية" },
  { level: "3 أدب + لغات", day: "الخميس", startTime: "20:00", endTime: "22:00", subject: "فرنسية" },
  { level: "3 أدب + لغات", day: "الجمعة", startTime: "20:00", endTime: "22:00", subject: "انجليزية" },

  { level: "2 أدب + لغات", day: "الأحد", startTime: "20:00", endTime: "22:00", subject: "فرنسية" },
  { level: "2 أدب + لغات", day: "الاثنين", startTime: "18:00", endTime: "19:30", subject: "فلسفة" },
  { level: "2 أدب + لغات", day: "الاثنين", startTime: "20:00", endTime: "22:00", subject: "انجليزية" },
  { level: "2 أدب + لغات", day: "الأربعاء", startTime: "18:00", endTime: "19:30", subject: "فلسفة" },
  { level: "2 أدب + لغات", day: "الأربعاء", startTime: "20:00", endTime: "22:00", subject: "اجتماعيات" },
  { level: "2 أدب + لغات", day: "الخميس", startTime: "18:00", endTime: "19:30", subject: "اسبانية" },
  { level: "2 أدب + لغات", day: "الجمعة", startTime: "20:00", endTime: "22:00", subject: "لغة عربية" },

  { level: "3 محاسبة", day: "الثلاثاء", startTime: "20:00", endTime: "22:00", subject: "محاسبة" },
  { level: "3 محاسبة", day: "الأربعاء", startTime: "20:00", endTime: "22:00", subject: "رياضيات" },
  { level: "2 محاسبة", day: "الخميس", startTime: "20:00", endTime: "22:00", subject: "محاسبة" },
];

export async function seedLiveSessions() {
  if (SESSIONS.length !== 39) {
    throw new Error(`Expected 39 sessions, got ${SESSIONS.length}`);
  }

  const existing = await prisma.liveSession.count();
  if (existing > 0) {
    console.log(`LiveSession already has ${existing} rows. Clearing before reseed...`);
    await prisma.liveSession.deleteMany();
  }

  const result = await prisma.liveSession.createMany({
    data: SESSIONS.map((row) => ({
      subject: row.subject,
      level: row.level,
      dayOfWeek: row.day,
      startTime: row.startTime,
      endTime: row.endTime,
      zoomLink: null,
    })),
  });

  console.log(`Seeded ${result.count} live sessions`);
  return result.count;
}

const isDirectRun = process.argv[1]?.includes("seed-live-sessions");

if (isDirectRun) {
  seedLiveSessions()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
