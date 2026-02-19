const request = require('supertest');
const { prisma } = require('./helpers/prisma-test-client.cjs');
const { describe, it } = require('./helpers/test-runner.cjs');
const kleur = require('kleur');

async function runPersonajesTests(BASE_URL) {
  await describe(kleur.blue('---- Tests: Personajes API (E2E) ----'), async () => {
    let personajeId;

    await describe(kleur.magenta('Modifications'), async () => {
      
      await prisma.character.deleteMany();

      await it('POST /personajes-bd', async () => {
        const res = await request(BASE_URL)
          .post('/personajes-bd')
          .send({ nombre: 'Guerrero Test', vida: 100, ataque: 20, nivel: 1 })
          .expect(201);

        personajeId = res.body.id;
        if (!personajeId) throw new Error(kleur.red('POST /personajes-bd did not return id'));

        console.log(kleur.green('✔ POST /personajes-bd'));
      });

      await it('PATCH /personajes-bd/:id', async () => {
        const res = await request(BASE_URL)
          .patch(`/personajes-bd/${personajeId}`)
          .send({ ataque: 35 })
          .expect(200);

        const updated = await prisma.character.findUnique({ where: { id: personajeId } });
        if (updated.ataque !== 35) throw new Error(kleur.red('Character not updated correctly'));
        
        console.log(kleur.green('✔ PATCH /personajes-bd/:id'));
      });

      await it('DELETE /personajes-bd/:id', async () => {
        await request(BASE_URL)
          .delete(`/personajes-bd/${personajeId}`)
          .expect(200);

        const deleted = await prisma.character.findUnique({ where: { id: personajeId } });
        if (deleted !== null) throw new Error(kleur.red('Character not deleted'));

        console.log(kleur.green('✔ DELETE /personajes-bd/:id'));
      });
    });

    await describe(kleur.magenta('Reads'), async () => {

      await it('GET /personajes-bd', async () => {
        const pj = await prisma.character.create({
          data: { nombre: 'Mago Test', vida: 80, ataque: 30, nivel: 1 },
        });
        personajeId = pj.id;

        const res = await request(BASE_URL).get('/personajes-bd').expect(200);
        
        if (!Array.isArray(res.body)) throw new Error(kleur.red('GET /personajes-bd did not return an array'));

        console.log(kleur.green('✔ GET /personajes-bd'));
      });

      await it('GET /personajes-bd/:id', async () => {
        const res = await request(BASE_URL)
          .get(`/personajes-bd/${personajeId}`)
          .expect(200);

        if (res.body.id !== personajeId) throw new Error(kleur.red('GET /personajes-bd/:id returned wrong character'));

        console.log(kleur.green('✔ GET /personajes-bd/:id'));
      });

    });

  });
  console.log(kleur.blue('✅   ---- Tests: Personajes E2E OK ----\n'));
}

module.exports = { runPersonajesTests };