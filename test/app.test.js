const request = require('supertest');
const { app, server } = require('../app');
const { ObjectId } = require("mongodb");

process.env.NODE_ENV = 'test';

let db;
let testId;

beforeAll(async () => {
    await request(app).get('/reset');
    db = await request(app).get('/');
    testId = db._body.docs[1].doc_id;
});


describe('API Endpoints', () => {
    describe('GET /', () => {
        it('/                          should get a JSON object', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Object);
        });
        it('/                          should have length and properties', async () => {
            const res = await request(app).get('/');
            expect(res.body.docs.length).toEqual(4);
            expect(res.body.docs[0]).toHaveProperty("_id");
            expect(res.body.docs[0]).toHaveProperty("title");
            expect(res.body.docs[0]).toHaveProperty("content");
            expect(res.body.docs[0]).toHaveProperty("created");
        });
    });
    describe('GET /docs/', () => {
        it('/docs/<non-existing-id>    should only have property `doc`', async () => {
            const id = new ObjectId().toString().slice(-6)
            const res = await request(app).get(`/docs/${id}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('doc');
            expect(res.body.doc).toEqual(null);
        });

        it('/docs/<testId>             should have properties `title` and `content`', async () => {
            const res = await request(app).get(`/docs/${testId}`);
            expect(res.statusCode).toEqual(200);
            expect(res._body.doc._id).toBeDefined();
            expect(res._body.doc.title).toEqual('Glass');
            expect(res._body.doc.content).toEqual('Glass är gott.');
            expect(res._body.doc.created).toBeDefined();

        });
    });
    describe('GET /add', () => {
        it('/add                       should add new doc with default values', async () => {
            const resBefore = await request(app).get('/');
            
            await request(app).get(`/add`);
            const resAfter = await request(app).get('/');

            expect(resBefore._body.docs.length).not.toEqual(resAfter._body.docs.length);
            expect(resAfter.body.docs[4]._id).toBeDefined();
            expect(resAfter.body.docs[4].title).toEqual('Namnlöst dokument');
            expect(resAfter.body.docs[4].content).toEqual('');
            expect(resAfter.body.docs[4].created).toBeDefined();
            
            await request(app).get('/reset'); 
        });

        it('/add/<title>/<content>     should add new doc with given values', async () => {
            const title = "Nytt dokument";
            const content = "Ny text";

            await request(app).get(`/add/${title}/${content}`);
            const res = await request(app).get('/');

            expect(res.body.docs[4]._id).toBeDefined();
            expect(res.body.docs[4].title).toEqual(title);
            expect(res.body.docs[4].content).toEqual(content);
            expect(res.body.docs[4].created).toBeDefined();

            await request(app).get('/reset');
        });
    });
});

afterAll(() => {
    server.close();
});