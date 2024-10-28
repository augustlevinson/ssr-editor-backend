const request = require("supertest");
const { app, server } = require("../app");
const { ObjectId } = require("mongodb");
const auth = require("../auth");
const fetchUrl = "http://localhost:1337";

process.env.NODE_ENV = "test";

let db;
let testId;
let testObjectId;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchGraphQL = async (query) => {
    const response = await fetch(fetchUrl + "/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query }),
    });
    return response.json();
};

beforeEach(async () => {
    await request(app).get("/reset");
    // db = await request(app).get("/all");
    // testId = db.body.docs[1].doc_id;
    // testObjectId = db.body.docs[1]._id;
});

describe("API Endpoints", () => {
    describe("GET /docs/", () => {
        // it("/docs/<non-existing-id>    should only have property `doc`", async () => {
        //     const id = new ObjectId().toString().slice(-6);
        //     const res = await request(app).get(`/docs/${id}`);
        //     expect(res.statusCode).toEqual(200);
        //     expect(res.body).toHaveProperty("doc");
        //     expect(res.body.doc).toEqual(null);
        // });

        // it("/docs/<testId>             should have properties `title` and `content`", async () => {
        //     const res = await request(app).get(`/docs/${testId}`);
        //     expect(res.statusCode).toEqual(200);
        //     expect(res.body.doc._id).toBeDefined();
        //     expect(res.body.doc.title).toEqual("Glass");
        //     expect(res.body.doc.content).toEqual("Glass är gott.");
        //     expect(res.body.doc.created).toBeDefined();
        // });
    });
    describe("PUT /add/:type", () => {
        it("/add/text                  should add new doc with default values", async () => {
            const details = {
                title: "Namnlöst dokument",
                content: "",
                email: "test@test.se",
                type: "text",
            };

            const addedTextDoc = await request(app).put(`/add/text`).send(details);

            const fetchedDoc = await request(app).get(`/docs/${addedTextDoc.body.new_id}`);

            expect(addedTextDoc.body.new_id).toBeDefined();
            expect(addedTextDoc.body.new_id).toHaveLength(6);
            expect(fetchedDoc.body.doc.title).toEqual("Namnlöst dokument");
            expect(fetchedDoc.body.doc.content).toEqual("");
            expect(fetchedDoc.body.doc.created).toBeDefined();
            expect(fetchedDoc.body.doc.updated).toBeDefined();
            expect(fetchedDoc.body.doc.type).toEqual("text");
        });
        it("/add/code                  should add new doc with default values", async () => {
            const details = {
                title: "Namnlöst dokument",
                content: "",
                email: "test@test.se",
                type: "code",
            };

            const addedCodeDoc = await request(app).put(`/add/code`).send(details);

            const fetchedDoc = await request(app).get(`/docs/${addedCodeDoc.body.new_id}`);
            expect(addedCodeDoc.body.new_id).toBeDefined();
            expect(addedCodeDoc.body.new_id).toHaveLength(6);
            expect(fetchedDoc.body.doc.title).toEqual("Namnlöst dokument");
            expect(fetchedDoc.body.doc.content).toEqual("");
            expect(fetchedDoc.body.doc.created).toBeDefined();
            expect(fetchedDoc.body.doc.updated).toBeDefined();
            expect(fetchedDoc.body.doc.type).toEqual("code");
        });
        
    });
    describe("PUT /edit", () => {
        it("/edit                      should edit a document with given values", async () => {

            const details = {
                title: "Namnlöst dokument",
                content: "",
                email: "test@test.se",
                type: "text",
            };

            const addedTextDoc = await request(app).put(`/add/text`).send(details);

            const resBefore = await request(app).get(`/docs/${addedTextDoc.body.new_id}`);

            const requestBody = {
                doc_id: addedTextDoc.body.new_id,
                title: "newTitle",
                content: "newContent",
            };
            await request(app).put("/edit").send(requestBody);
            const resAfter = await request(app).get(`/docs/${addedTextDoc.body.new_id}`);

            expect(resBefore.body.doc.title).not.toEqual(resAfter.body.doc.title);
            expect(resBefore.body.doc.content).not.toEqual(resAfter.body.doc.content);
            expect(resAfter.body.doc.title).toEqual("newTitle");
            expect(resAfter.body.doc.content).toEqual("newContent");
            expect(resAfter.body.doc.created).toEqual(resBefore.body.doc.created);
        });
    });

    describe("PUT /comment/add", () => {
        it("/comment/add               should add a comment to a document", async () => {

        });
    });

    describe("PUT /comment/delete", () => {
        it("/comment/delete            should delete a comment from a document", async () => {

        });
    });


    describe("POST /send", () => {
        it("/send                      should send invite to email", async () => {

        });
    });

    describe("DELETE /delete", () => {
        it("/delete                    should delete given document", async () => {
            const details = {
                title: "Namnlöst dokument",
                content: "",
                email: "test@test.se",
                type: "text",
            };

            const addedTextDoc = await request(app).put(`/add/text`).send(details);

            const resBefore = await request(app).get(`/docs/${addedTextDoc.body.new_id}`);
            const requestBody = {
                id: addedTextDoc.body.new_id,
            };

            await request(app).delete("/delete").send(requestBody);
            const resAfter = await request(app).get(`/docs/${addedTextDoc.body.new_id}`);

            expect(resBefore.body.doc).not.toEqual(resAfter.body.doc);
            expect(resAfter.body.doc).toEqual(null);
        });

        it("/delete                    should fail to delete non-existing", async () => {
            const faultyId = new ObjectId().toString().slice(-6);

            const requestBody = {
                id: faultyId,
            };

            const res = await request(app).delete("/delete").send(requestBody);
            expect(res.body.deleted.deletedCount).toEqual(0);
        });
    });

    describe("POST /users/register", () => {
        it("/users/register            should register a new user", async () => {
            const registerBody = {
                email: "test@test.se",
                password: "password",
            };

            const newUser = await request(app).post("/users/register").send(registerBody);

            const loginBody = {
                email: "test@test.se",
                password: "password",
            };

            const login = await request(app).post("/users/login").send(loginBody);

            const user = await auth.getOne("test@test.se");
        });
    });

    describe("POST /users/login", () => {
        it("/users/login               should authenticate a registered user", async () => {

        });
    });
});

afterAll(() => {
    server.close();
});
