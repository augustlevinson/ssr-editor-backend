const request = require("supertest");
const { app, server } = require("../app");
const { ObjectId } = require("mongodb");
const auth = require("../auth");
const docs = require("../docs");
const mail = require("../mail");
const sgMail = require('@sendgrid/mail')
const socketClient = require("socket.io-client")

// const fetchUrl = "http://localhost:1337";

process.env.NODE_ENV = "test";

jest.setTimeout(15000);
jest.mock('@sendgrid/mail');

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

const mockUser = async (userEmail="test@test.se") => {
    const registerBody = {
        email: userEmail,
        password: "password",
    };

    await request(app).post("/users/register").send(registerBody);
    const user = await auth.getOne(userEmail);
    
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

const mockInvitedDocument = async (mockedDoc) => {
    addedDoc = mockedDoc.addedDoc;
    fetchedDoc = mockedDoc.fetchedDoc;

    const requestBody = {
        doc_id: addedDoc.body.new_id,
        recipient: "invited@test.se"
    };

    await docs.addInvite(requestBody);
    const invitedDoc = await request(app).get(`/docs/${addedDoc.body.new_id}`);
    return { addedDoc, fetchedDoc, invitedDoc };
}

// const mockCollaboratorDocument = async (mockedDoc) => {
//     addedDoc = mockedDoc.addedDoc;
//     fetchedDoc = mockedDoc.fetchedDoc;
//     const inviteBody = {
//         doc_id: addedDoc.body.new_id,
//         recipient: "collaborator@test.se"
//     };

//     await docs.addInvite(inviteBody);

//     const acceptBody = {
//         docId: inviteBody.doc_id,
//         email: inviteBody.recipient
//     };

//     await docs.acceptInvitation(acceptBody);

//     const collaboratorDoc = await request(app).get(`/docs/${addedDoc.body.new_id}`);
//     return { addedDoc, fetchedDoc, collaboratorDoc };
// }

const deleteMockDocument = async (docId) => {
    await docs.deleteOne(docId)
}

beforeEach(async () => {
    await docs.resetDb();
    jest.clearAllMocks();
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

    describe("GET /accept/:id", () => {
        it("/accept/:id                should add user ID to collaborators and remove email from invited", async () => {
            const type = "text";
            const { user: owner } = await mockUser();
            const { user: invited } = await mockUser("invited@test.se");
            const { addedDoc } = await mockInvitedDocument(await mockDocument(type));

            const docId = addedDoc.body.new_id;
            const res = await request(app)
                .get(`/accept/${docId}`)
                .set("session-variable", JSON.stringify({ email: "invited@test.se" }));

            const resAfter = await request(app).get(`/docs/${docId}`);
            const acceptedDoc = resAfter.body.doc

            expect(res.body).toBeDefined();
            expect(res.body.accepted.acknowledged).toEqual(true);
            expect(acceptedDoc.collaborators).toHaveLength(1);
            expect(acceptedDoc.collaborators[0]).toEqual(invited._id.toString());
            expect(acceptedDoc.invited).toHaveLength(0);

            await deleteMockUser(owner._id);
            await deleteMockUser(invited._id);
            await deleteMockDocument(addedDoc.body.new_id);
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

    describe("PUT /comment/add", () => {
        it("/comment/add               should add a comment to a document", async () => {
            const type = "text";
            const { user } = await mockUser();
            const { addedDoc, fetchedDoc } = await mockDocument(type);

            const requestBody = {
                doc_id: addedDoc.body.new_id,
                comment_id: 123,
                content: "newComment",
                user: user.email
            }
            await request(app).put("/comment/add").send(requestBody);
            const resAfter = await request(app).get(`/docs/${addedDoc.body.new_id}`);

            expect(fetchedDoc.body.doc.comments).toEqual([]);
            expect(resAfter.body.doc.comments).toHaveLength(1);
            expect(resAfter.body.doc.doc_id).toEqual(addedDoc.body.new_id);
            expect(resAfter.body.doc.comments[0].id).toEqual(123);
            expect(resAfter.body.doc.comments[0].content).toEqual("newComment");
            expect(resAfter.body.doc.comments[0].user).toEqual(user.email);

            await deleteMockUser(user._id);
            await deleteMockDocument(addedDoc.body.new_id);
        });

    });

    describe("PUT /comment/delete", () => {
        it("/comment/delete            should delete a comment from a document", async () => {
            const type = "text";
            const { user } = await mockUser();
            const { addedDoc } = await mockDocument(type);

            const requestBody = {
                doc_id: addedDoc.body.new_id,
                comment_id: 123,
                content: "newComment",
                user: user.email
            }

            const deleteBody = {
                doc_id: addedDoc.body.new_id,
                comment_id: 123,
            }

            const commentedDoc = await request(app).put("/comment/add").send(requestBody);
            await request(app).put("/comment/delete").send(deleteBody);

            const resAfter = await request(app).get(`/docs/${addedDoc.body.new_id}`);

            expect(commentedDoc.body.doc.comments).toHaveLength(1);
            expect(resAfter.body.doc.comments).toHaveLength(0);

            await deleteMockUser(user._id);
            await deleteMockDocument(addedDoc.body.new_id);
        });
    });

    describe("SendEmail", () => {
        it("send                       should send invite to email", async () => {
            const credentials = { 
                recipient: "invited@invited.se",
                sender: "sender@sender.se",
                title: "Namnlöst dokument för inbjudan.",
                url: "http://localhost:3000/"
            };

            sgMail.send.mockResolvedValueOnce("Email sent"); 

            await mail.sendEmail(credentials);

            expect(sgMail.setApiKey).toHaveBeenCalledWith(process.env.SENDGRID_API_KEY);
            expect(sgMail.send).toHaveBeenCalledWith({
                to: credentials.recipient,
                from: process.env.SENDGRID_SENDER,
                subject: `${credentials.sender} har bjudit in dig att redigera "${credentials.title}"`,
                text: 'and easy to do anywhere, even with Node.js',
                html: `<p>Du har blivit inbjudan att redigera ${credentials.title} i SSR Editor.</p>
                    <a href="${credentials.url}">Acceptera inbjudan</a>
                    <p>Vänligen</p>
                    <p><i>SSR Editor</i></p>`
            });
        });
        
        it("send                       should fail invite to email", async () => {
            const credentials = { 
                recipient: "invited@invited.se",
                sender: "sender@sender.se",
                title: "Namnlöst dokument för inbjudan.",
                url: "http://localhost:3000/"
            };

            sgMail.send.mockRejectedValueOnce(new Error("Failed to send email"));

            await mail.sendEmail(credentials);

            expect(sgMail.setApiKey).toHaveBeenCalledWith(process.env.SENDGRID_API_KEY);
            expect(sgMail.send).toHaveBeenCalled();
        });
    });

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

    describe("Socket connections", () => {
        let socket;
    
        beforeEach((done) => {
            socket = socketClient("http://localhost:1337");
            socket.on("connect", () => {
                done();
            });
        });
    
        afterEach((done) => {
            // sätter timeout för att hinna få med
            // throttle för sockets utan errors.
            setTimeout(() => {
                done();
            }, 2500)
            socket.disconnect();
        });
    
        it("should join a room", async () => {
            const type = "text";
            const { user } = await mockUser();
            const { addedDoc } = await mockDocument(type);

            const mockDocId = addedDoc.body.new_id;
            socket.emit("join", mockDocId);
    
            socket.on("enterDoc", (doc) => {
                expect(doc).toHaveProperty("doc_id", mockDocId);
                expect(doc.owner).toEqual(JSON.stringify(user._id).replace(/^"|"$/g, ''));
            });

            await deleteMockUser(user._id);
            await deleteMockDocument(addedDoc.body.new_id);
        });
    
        it("should update via socket", async () => {
            const type = "text";
            const { user } = await mockUser();
            const { addedDoc } = await mockDocument(type);

            const mockDocId = addedDoc.body.new_id;
            const updateData = {
                doc_id: mockDocId,
                title: "Updated via socket",
                content: "Updated content",
                comments: []
            };    
            
            socket.on("update", (updatedDoc) => {
                expect(updatedDoc).toHaveProperty("title", "Updated via socket");
                expect(updatedDoc).toHaveProperty("doc_id", mockDocId);
                expect(updatedDoc).toHaveProperty("content", "Updated content");
                expect(updatedDoc).toHaveProperty("comments", []);
            });
    
            socket.emit("update", updateData);

            await deleteMockUser(user._id);
            await deleteMockDocument(addedDoc.body.new_id);
        });
    });

});

afterAll(() => {
    server.close();
});
