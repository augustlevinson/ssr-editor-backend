const request = require('supertest');
const { app, server } = require('../app');

describe('API Endpoints', () => {
    it('/                          should get a JSON object', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Object);
    });

    it('/docs/<non-existing-id>    should have property `doc`', async () => {
        // skickar in ett id som inte finns (men är giltigt, annars går det inte)
        const res = await request(app).get('/docs/5f9f3b3b3b3b3b3b3b3b3b3b');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('doc');
    });
});

// Stäng servern efter testerna
afterAll(() => {
    server.close();
});