require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg'); 

const { seedUsers } = require('./users.seed.cjs');
const { seedCharacters } = require('./characters.seed.cjs');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:diego@localhost:5432/batallaFriki?schema=public" 
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  await seedUsers(prisma);
  await seedCharacters(prisma);

  console.log('🌱 Database seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });