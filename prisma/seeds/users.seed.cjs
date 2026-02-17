const bcrypt = require('bcrypt');

async function seedUsers(prisma) {
  console.log('🌱 Seeding users...');

  const hashedPassword = await bcrypt.hash('123', 10);

  await prisma.user.createMany({
    data: [
      { 
        nick: 'Admin Test', 
        email: 'admin@test.com', 
        password: hashedPassword, 
        rol: 'ADMIN' 
      },
      { 
        nick: 'User Test', 
        email: 'user@test.com', 
        password: hashedPassword, 
        rol: 'USER' 
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Users seeded');
}

module.exports = { seedUsers };