async function seedCharacters(prisma) {
  console.log('🌱 Seeding characters...');

  await prisma.character.createMany({
    data: [
      {
        nombre: 'Gandalf',
        vida: 100,
        ataque: 20,
        nivel: 1,
        nivelMinimoObtencion: 1,
        imagen: 'https://static.wikia.nocookie.net/eldragonverde/images/4/47/Gandalf.png/revision/latest?cb=20121217202035&path-prefix=es'
      },
      {
        nombre: 'Sauron',
        vida: 30,
        ataque: 5,
        nivel: 5,
        nivelMinimoObtencion: 1,
        imagen: 'https://static.wikia.nocookie.net/eldragonverde/images/3/3a/Sauron.jpg/revision/latest?cb=20110626161300&path-prefix=es'
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Characters seeded');
}

module.exports = { seedCharacters };