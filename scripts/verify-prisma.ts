import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  try {
    const wilayas = await prisma.wilaya.findMany({ take: 1 });
    console.log('✅ Connected. Found wilaya:', wilayas[0]?.name);
  } catch (err) {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
