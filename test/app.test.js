const request = require('supertest');
const { app, server } = require('../app');
const { ObjectId } = require("mongodb");

process.env.NODE_ENV = 'test';

let db;
let testId;
let testObjectId;

beforeAll(async () => {
    await request(app).get('/reset');
    db = await request(app).get('/all');
    testId = db.body.docs[1].doc_id;
    testObjectId = db.body.docs[1]._id
});


describe('API Endpoints', () => {
    describe('GET /all', () => {
        it('/all                       should get a JSON object', async () => {
            const res = await request(app).get('/all');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Object);
        });
        it('/all                       should have length and properties', async () => {
            const res = await request(app).get('/all');
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
            expect(res.body.doc._id).toBeDefined();
            expect(res.body.doc.title).toEqual('Glass');
            expect(res.body.doc.content).toEqual('Glass är gott.');
            expect(res.body.doc.created).toBeDefined();

        });
    });
    describe('GET /add', () => {
        it('/add                       should add new doc with default values', async () => {
            const resBefore = await request(app).get('/');
            
            await request(app).get(`/add`);
            const resAfter = await request(app).get('/');

            expect(resBefore.body.docs.length).not.toEqual(resAfter.body.docs.length);
            expect(resAfter.body.docs[4]._id).toBeDefined();
            expect(resAfter.body.docs[4].title).toEqual('Namnlöst dokument');
            expect(resAfter.body.docs[4].content).toEqual('');
            expect(resAfter.body.docs[4].created).toBeDefined();
            
            await request(app).get('/reset'); 
        });
    });
    describe('PUT /edit', () => {
        it("/edit                      should edit a document with given values", async () => {
            const resBefore = await request(app).get(`/docs/${testId}`);
            const requestBody = {
                doc_id: testId,
                title: "newTitle",
                content: "newContent"
            };
            await request(app).put("/edit").send(requestBody)
            const resAfter = await request(app).get(`/docs/${testId}`);
            
            expect(resBefore.body.doc.title).not.toEqual(resAfter.body.doc.title)
            expect(resBefore.body.doc.content).not.toEqual(resAfter.body.doc.content)

            await request(app).get('/reset'); 
        });
    });
    
    describe('DELETE /delete', () => {
        it("/delete                    should delete given document", async () => {
            await request(app).get(`/docs/${testId}`);
            const requestBody = {
                id: testId
            }

            await request(app).delete("/delete").send(requestBody)
            const resAfter = await request(app).get(`/docs/${testId}`);

            expect(resAfter.body.doc).toEqual(null)

            await request(app).get('/reset');
        });
        
        it("/delete                    should fail to delete", async () => {
            const faultyId = new ObjectId().toString().slice(-6)
            
            const requestBody = {
                id: faultyId
            }

            const res = await request(app).delete("/delete").send(requestBody)
            expect(res.body.deleted.deletedCount).toEqual(0)            
        });
    });
});

afterAll(() => {
    server.close();
});