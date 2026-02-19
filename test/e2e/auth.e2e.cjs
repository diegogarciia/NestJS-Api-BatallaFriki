const request = require('supertest');
const { prisma } = require('./helpers/prisma-test-client.cjs');
const { describe, it } = require('./helpers/test-runner.cjs');
const kleur = require('kleur');
const bcrypt = require('bcrypt'); 

async function runAuthTests(BASE_URL) {
  await describe(kleur.blue('---- Tests: Auth API (E2E) ----'), async () => {
    
    const testEmail = 'login@test.com';
    const testPassword = 'mypassword123';
    
    await describe(kleur.magenta('Setup & Login'), async () => {
      
      await prisma.user.deleteMany();

      await it('Setup User for Auth', async () => {
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        await prisma.user.create({
          data: {
            email: testEmail,
            nick: 'LoginUser',
            password: hashedPassword,
            rol: 'USER'
          }
        });
        console.log(kleur.green('✔ Setup User'));
      });

      await it('POST /auth/login (Success)', async () => {
        const res = await request(BASE_URL)
          .post('/auth/login')
          .send({ email: testEmail, password: testPassword })
          .expect(201); 

        if (!res.body.access_token) throw new Error(kleur.red('Login did not return a token'));

        console.log(kleur.green('✔ POST /auth/login (Success)'));
      });

      await it('POST /auth/login (Wrong Password)', async () => {
        await request(BASE_URL)
          .post('/auth/login')
          .send({ email: testEmail, password: 'wrongpassword' })
          .expect(401); 
          
        console.log(kleur.green('✔ POST /auth/login (Unauthorized on wrong password)'));
      });

    });
  });
  console.log(kleur.blue('✅   ---- Tests: Auth E2E OK ----\n'));
}

module.exports = { runAuthTests };