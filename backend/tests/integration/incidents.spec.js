const request = require('supertest');
const app = require('../../src/app');
const connection = require('../../src/database/connection');

describe('INCIDENTS', () => {

    var ongId = '';

    beforeEach(async () => {
        await connection.migrate.latest();
    });

    afterAll(async () => {
        await connection.migrate.rollback();
        await connection.destroy();
    });

    it('should be able to create a new Incident', async () => {
        const {body: ong} = await request(app)
        .post('/ongs')
        .send({
            name: "Ong 1",
            email: "contato@ong.com",
            whatsapp: 53000000000,
            city: "cidade",
            uf: "UF"
        });
        ongId = ong.id;

        const response = await request(app)
        .post('/incidents')
        .set('Authorization', ongId)
        .send({
            "title": "Caso Teste 1",
            "description": "Descrição Teste 1",
            "value": 300
        });
        
        expect(response.body).toHaveProperty('id');
    });

    it('should be able to select incidents by page', async () => {

        function checkIncident(incident) {

            expect(incident).toHaveProperty('id');
            expect(incident).toHaveProperty('title');
            expect(incident).toHaveProperty('description');
            expect(incident).toHaveProperty('value');
            expect(incident).toHaveProperty('ong_id');
            expect(incident.ong_id).toHaveLength(8);
            if(incident.ong_id != ongId)
                throw Error(`should return ong_id equals to ${ongId}`);
            expect(incident).toHaveProperty('name');
            expect(incident).toHaveProperty('email');
            expect(incident).toHaveProperty('whatsapp');
            expect(incident).toHaveProperty('city');
            expect(incident).toHaveProperty('uf');
            expect(incident.uf).toHaveLength(2);

        }

        await request(app).post('/incidents').set('Authorization', ongId)
        .send({
            "title": "Caso Teste 2",
            "description": "Descrição Teste 2",
            "value": 300
        });
        await request(app).post('/incidents').set('Authorization', ongId)
        .send({
            "title": "Caso Teste 3",
            "description": "Descrição Teste 3",
            "value": 300
        })
        await request(app).post('/incidents').set('Authorization', ongId)
        .send({
            "title": "Caso Teste 4",
            "description": "Descrição Teste 4",
            "value": 300
        })
        await request(app).post('/incidents').set('Authorization', ongId)
        .send({
            "title": "Caso Teste 5",
            "description": "Descrição Teste 5",
            "value": 300
        })
        await request(app).post('/incidents').set('Authorization', ongId)
        .send({
            "title": "Caso Teste 6",
            "description": "Descrição Teste 6",
            "value": 300
        });

        await request(app)
        .get('/incidents')
        .query({page : 1})
        .expect((res) => {
            if(!(res.body instanceof Array))
                throw new Error("result is not an array");
            if(res.body.length != 5)
                throw new Error(`result should contain 5 elements, contains ${res.body.length}`);
            
            expect(res.header).toHaveProperty('x-total-count');
            if(res.header['x-total-count'] != 6)
                throw new Error(`header total count should be 6, returned ${res.header['x-total-count']}`)

            checkIncident(res.body[0]);
            
        });

        await request(app)
        .get('/incidents')
        .query({page : 2})
        .expect((res) => { 
            if(!(res.body instanceof Array))
                throw new Error("result is not an array");
            if(res.body.length != 1)
                throw new Error(`result should contain 1 elements, contains ${res.body.length}`);
            
            expect(res.header).toHaveProperty('x-total-count');
            if(res.header['x-total-count'] != 6)
                throw new Error(`header total count should be 6, returned ${res.header['x-total-count']}`)

            checkIncident(res.body[0]);
            
        });

    });

    it('should be able to delete incident by id and authorization', async () => {
        
        const {body : incident} = await request(app).post('/incidents').set('Authorization', ongId)
        .send({
            "title": "Caso Teste Deleção",
            "description": "Descrição Teste Deleção",
            "value": 100
        });

        const response = await request(app)
        .delete(`/incidents/${incident.id}`)
        .set('Authorization', ongId);

        expect(response).toHaveProperty('statusCode');
        if(response.statusCode != 204)
            throw new Error(`response status code should be 204, returned ${response.statusCode}`);

    });

});