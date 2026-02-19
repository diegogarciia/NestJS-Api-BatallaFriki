const request = require('supertest');
const { prisma } = require('./helpers/prisma-test-client.cjs');
const { describe, it } = require('./helpers/test-runner.cjs');
const kleur = require('kleur');

async function runUsersTests(BASE_URL) {
  await describe(kleur.blue('---- Tests: Users API (E2E) ----'), async () => {
    let userId;

    await describe(kleur.magenta('Modifications'), async () => {

      await prisma.user.deleteMany();

      await it('POST /users', async () => {
        const res = await request(BASE_URL)
          .post('/users')
          .send({ email: 'nuevo@test.com', nick: 'NuevoUser', password: '123', rol: 'USER' })
          .expect(201);

        userId = res.body.id || res.body.user?.id; 
        if (!userId) throw new Error(kleur.red('POST /users did not return id'));

        console.log(kleur.green('✔ POST /users'));
      });

      await it('PATCH /users/:id', async () => {
        const res = await request(BASE_URL)
          .patch(`/users/${userId}`)
          .send({ nick: 'NickActualizado' })
          .expect(200);

        const updated = await prisma.user.findUnique({ where: { id: userId } });
        if (updated.nick !== 'NickActualizado') throw new Error(kleur.red('User not updated'));
        
        console.log(kleur.green('✔ PATCH /users/:id'));
      });

      await it('DELETE /users/:id', async () => {
        await request(BASE_URL)
          .delete(`/users/${userId}`)
          .expect(200);

        const deleted = await prisma.user.findUnique({ where: { id: userId } });
        if (deleted !== null) throw new Error(kleur.red('User not deleted'));

        console.log(kleur.green('✔ DELETE /users/:id'));
      });
    });

    await describe(kleur.magenta('Reads'), async () => {

      await it('GET /users', async () => {
        const user = await prisma.user.create({
          data: { email: 'read@test.com', nick: 'ReadUser', password: '123' },
        });
        userId = user.id;

        const res = await request(BASE_URL).get('/users').expect(200);
        
        if (!Array.isArray(res.body)) throw new Error(kleur.red('GET /users did not return an array'));

        console.log(kleur.green('✔ GET /users'));
      });

      await it('GET /users/:id', async () => {
        const res = await request(BASE_URL)
          .get(`/users/${userId}`)
          .expect(200);

        if (res.body.id !== userId) throw new Error(kleur.red('GET /users/:id returned wrong user'));

        console.log(kleur.green('✔ GET /users/:id'));
      });

    });

  });
  console.log(kleur.blue('✅   ---- Tests: Users E2E OK ----\n'));
}

module.exports = { runUsersTests };