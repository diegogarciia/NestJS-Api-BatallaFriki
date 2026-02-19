const { runUsersTests } = require('../users.e2e.cjs');
const { runPersonajesTests } = require('../personajes.e2e.cjs');
const { runAuthTests } = require('../auth.e2e.cjs');

const BASE_URL = 'http://localhost:3000'; 

async function main() {
  try {
    await runUsersTests(BASE_URL);
    await runPersonajesTests(BASE_URL);
    await runAuthTests(BASE_URL);
    
    console.log('🎉 TODOS LOS TESTS PASARON CON ÉXITO');
    process.exit(0);
  } catch (error) {
    console.error('💥 ERROR EN LOS TESTS:', error);
    process.exit(1);
  }
}

main();