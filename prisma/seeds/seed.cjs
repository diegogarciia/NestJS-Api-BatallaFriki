const { PrismaClient } = require('@prisma/client');
const { seedUsers } = require('./users.seed.cjs');
const { seedCharacters } = require('./characters.seed.cjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el sembrado de datos...');
  
  await seedUsers(prisma);
  
  await seedCharacters(prisma);
  
  console.log('Proceso finalizado con éxito.');
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });