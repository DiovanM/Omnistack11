const request = require('supertest');
const app = require('../../src/app');
const connection = require('../../src/database/connection');

describe('ONG', () => {

    beforeEach(async () => {
        await connection.migrate.latest();
    });

    afterAll(async () => {
        await connection.migrate.rollback();
        await connection.destroy();
    });

    it('should be able to create a new ONG', async () => {
        const  response = await request(app)
        .post('/ongs')
        .send({
            name: "Ong",
            email: "contato@ong.com",
            whatsapp: 53000000000,
            city: "cidade",
            uf: "UF"
        });

        expect(response.body).toHaveProperty('id');
        expect(response.body.id).toHaveLength(8);
    });

    it('should be able to return all ONGs', async () => {
            const response = await request(app)
            .get('/ongs')
            .expect((res) => {
                if(!(res.body instanceof Array))
                    throw new Error("result is not an array");
                if(res.body.length == 0)
                    throw new Error("result is empty, should have at least one element")

                const ong = res.body[0];

                expect(ong).toHaveProperty("id");
                expect(ong.id).toHaveLength(8);
                expect(ong).toHaveProperty("name");
                expect(ong).toHaveProperty("email");
                expect(ong).toHaveProperty("whatsapp");
                expect(ong).toHaveProperty("city");
                expect(ong).toHaveProperty("uf");

            });
        });
    });