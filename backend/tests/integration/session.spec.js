const request = require('supertest');
const app = require('../../src/app');
const connection = require('../../src/database/connection');

describe('ONG DASHBOARD', () => { 

    var ongId = '';

    beforeEach(async () => {
        await connection.migrate.latest();
    });

    afterAll(async () => {
        await connection.migrate.rollback();
        connection.destroy();
    });

    it('should be able to login with ong_id and return the ong`s name', async () => {
        const ongName = "Ong Teste";

        const {body: ong} = await request(app)
        .post('/ongs')
        .send({
            name: ongName,
            email: "contato@ong.com",
            whatsapp: 53000000000,
            city: "cidade",
            uf: "UF"
        });
        ongId = ong.id;

        const response = await request(app)
        .post('/sessions')
        .send({
            "id": ongId
        });
        
        expect(response.body).toHaveProperty('name');
        if(response.body.name != ongName)
            throw new Error(`returned ONG name different from ${ongName}, returned ${response.body.name}`);
    });

    it('should be able to list all incidents related to the ong_id', async () => {
        await request(app)
        .post('/incidents')
        .set('Authorization', ongId)
        .send({
            "title": "Caso Teste",
            "description": "Descrição Teste",
            "value": 300
        });

        const response = await request(app)
        .get('/profile')
        .set('Authorization', ongId);

        if(!response.body instanceof Array)
            throw new Error('response.body should contain an array');

        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('title');
        expect(response.body[0]).toHaveProperty('description');
        expect(response.body[0]).toHaveProperty('value');
        expect(response.body[0]).toHaveProperty('ong_id');
        if(response.body[0].ong_id != ongId)
            throw new Error(`incident return should contain the ong_id ${ongId}, contains ${response.body[0].ong_id}`);

    });

});