const request = require("supertest");
const { app, server } = require("../app");
const { ObjectId } = require("mongodb");
const auth = require("../auth");
const docs = require("../docs");
// const fetchUrl = "http://localhost:1337";

process.env.NODE_ENV = "test";

jest.setTimeout(10000);

// const fetchGraphQL = async (query) => {
//     const response = await fetch(fetchUrl + "/graphql", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ query: query }),
//     });
//     return response.json();
// };

const mockUser = async () => {
    const registerBody = {
        email: "test@test.se",
        password: "password",
    };

    await request(app).post("/users/register").send(registerBody);
    const user = await auth.getOne("test@test.se");
    
    return { registerBody, user }
}

const deleteMockUser = async (userId) => {
    await auth.deleteOne(userId)
}

const mockDocument = async (docType) => {
    const details = {
        title: "Namnlöst dokument",
        content: "",
        email: "test@test.se",
        type: docType,
    };

    const addedDoc = await request(app).put(`/add/text`).send(details);
    const fetchedDoc = await request(app).get(`/docs/${addedDoc.body.new_id}`);

    return { addedDoc, fetchedDoc }
}

const deleteMockDocument = async (docId) => {
    await docs.deleteOne(docId)
}

beforeEach(async () => {
    await docs.resetDb();
});

describe("API Endpoints", () => {
    describe("GET /docs/", () => {
        it("/docs/<non-existing-id>    should only have property `doc`", async () => {
            const id = new ObjectId().toString().slice(-6);
            const res = await request(app).get(`/docs/${id}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("doc");
            expect(res.body.doc).toEqual(null);
        });
    });
    describe("PUT /add/:type", () => {
        it("/add/text                  should add new doc with default values", async () => {
            const type = "text";
            const { user } = await mockUser();
            const { addedDoc, fetchedDoc } = await mockDocument(type);

            expect(addedDoc.body.new_id).toBeDefined();
            expect(addedDoc.body.new_id).toHaveLength(6);
            expect(fetchedDoc.body.doc.title).toEqual("Namnlöst dokument");
            expect(fetchedDoc.body.doc.content).toEqual("");
            expect(fetchedDoc.body.doc.created).toBeDefined();
            expect(fetchedDoc.body.doc.updated).toBeDefined();
            expect(fetchedDoc.body.doc.type).toEqual("text");

            await deleteMockUser(user._id);
            await deleteMockDocument(addedDoc.body.new_id);
        });
        it("/add/code                  should add new doc with default values", async () => {
            const type = "code";
            const { user } = await mockUser();
            const { addedDoc, fetchedDoc } = await mockDocument(type);

            expect(addedDoc.body.new_id).toBeDefined();
            expect(addedDoc.body.new_id).toHaveLength(6);
            expect(fetchedDoc.body.doc.title).toEqual("Namnlöst dokument");
            expect(fetchedDoc.body.doc.content).toEqual("");
            expect(fetchedDoc.body.doc.created).toBeDefined();
            expect(fetchedDoc.body.doc.updated).toBeDefined();
            expect(fetchedDoc.body.doc.type).toEqual("code");

            await deleteMockUser(user._id);
            await deleteMockDocument(addedDoc.body.new_id);
        });
        
    });
    describe("PUT /edit", () => {
        it("/edit                      should edit a document with given values", async () => {
            const type = "text";
            const { user } = await mockUser();
            const { addedDoc, fetchedDoc } = await mockDocument(type);

            const requestBody = {
                doc_id: addedDoc.body.new_id,
                title: "newTitle",
                content: "newContent",
            };
            await request(app).put("/edit").send(requestBody);
            const resAfter = await request(app).get(`/docs/${addedDoc.body.new_id}`);

            expect(fetchedDoc.body.doc.title).not.toEqual(resAfter.body.doc.title);
            expect(fetchedDoc.body.doc.content).not.toEqual(resAfter.body.doc.content);
            expect(resAfter.body.doc.title).toEqual("newTitle");
            expect(resAfter.body.doc.content).toEqual("newContent");
            expect(resAfter.body.doc.created).toEqual(fetchedDoc.body.doc.created);

            await deleteMockUser(user._id);
            await deleteMockDocument(addedDoc.body.new_id);
        });
    });

    // describe("PUT /comment/add", () => {
    //     it("/comment/add               should add a comment to a document", async () => {

    //     });
    // });

    // describe("PUT /comment/delete", () => {
    //     it("/comment/delete            should delete a comment from a document", async () => {

    //     });
    // });


    // describe("POST /send", () => {
    //     it("/send                      should send invite to email", async () => {

    //     });
    // });

    describe("DELETE /delete", () => {
        it("/delete                    should delete given document", async () => {
            const type = "text";
            const { user } = await mockUser();
            const { addedDoc, fetchedDoc } = await mockDocument(type);

            const requestBody = {
                    id: addedDoc.body.new_id,
                };
                
            await request(app).delete("/delete").send(requestBody);
            const resAfter = await request(app).get(`/docs/${addedDoc.body.new_id}`);
                
            expect(fetchedDoc.body.doc).not.toEqual(resAfter.body.doc);
            expect(resAfter.body.doc).toEqual(null);

            await deleteMockUser(user._id);
            await deleteMockDocument(addedDoc.body.new_id);
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
            const { registerBody, user } = await mockUser();
            
            expect(user).toBeDefined();
            expect(user.email).toEqual(registerBody.email)

            deleteMockUser(user._id);

        });
    });

    describe("POST /users/login", () => {
        it("/users/login               should authenticate a registered user", async () => {
            const {  user } = await mockUser();
            const loginBody = {
                email: "test@test.se",
                password: "password",
            };

            const login = await request(app).post("/users/login").send(loginBody);
            
            expect(user).toBeDefined();
            expect(login.body.success).toBeTruthy();
            expect(login.body.jwtToken).toBeDefined();
            expect(login.body.jwtToken).toHaveLength(159);

            await deleteMockUser(user._id);
        });
    });
});

afterAll(() => {
    server.close();
});
