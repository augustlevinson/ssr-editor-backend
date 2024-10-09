const { ObjectId } = require("mongodb");
const getDb = require("./db/database.js");
const auth = require("./auth.js")
const colName = "entries";

let setupContent = require("./db/setupContent.json");

const docs = {
    getAll: async function getAll() {
        let db = await getDb(colName);

        try {
            return await db.collection.find({}).toArray();
        } catch (e) {
            console.error(e);

            return [];
        } finally {
            await db.client.close();
        }
    },

    getAllByUserId: async function getAllByUserId(userId) {
        let db = await getDb(colName);

        try {
            return await db.collection.find({ owner: userId }).toArray();
        } catch (e) {
            console.error(e);

            return [];
        } finally {
            await db.client.close();
        }
    },

    getInvitedByEmail: async function getInvitedByEmail(email) {
        let db = await getDb(colName);

        try {
            return await db.collection.find({ invited: email }).toArray();
        } catch (e) {
            console.error(e);

            return [];
        } finally {
            await db.client.close();
        }
    },

    getCollaboratorByEmail: async function getCollaboratorByEmail(email) {
        let db = await getDb(colName);
        
        const user = await auth.getOne(email);


        try {
            const response = await db.collection.find({ collaborators: user._id }).toArray();
            return response;
        } catch (e) {
            console.error(e);

            return [];
        } finally {
            await db.client.close();
        }
    },

    getOne: async function getOne(id) {
        let db = await getDb(colName);
        try {
            return await db.collection.findOne({ doc_id: id });
        } catch (e) {
            console.error(e);

            return {};
        } finally {
            await db.client.close();
        }
    },

    addOne: async function addOne(addTitle, addContent, addOwner, addType) {
        let db = await getDb(colName);
        let addCreated = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" });
        let updatedContent;
        try {
            await db.collection.insertOne({
                title: addTitle,
                owner: new ObjectId(`${addOwner}`),
                invited: [],
                collaborators: [],
                comments: [],
                content: addContent,
                created: addCreated,
                updated: addCreated,
                type: addType,
            });
            const addDoc = await db.collection.findOne({ created: addCreated });
            const filter = { _id: new ObjectId(`${addDoc._id}`) };
            updatedContent = {
                ...addDoc,
                doc_id: filter._id.toString().slice(-6),
            };
            await db.collection.updateOne(filter, { $set: updatedContent });
        } catch (e) {
            console.error(e);
        } finally {
            await db.client.close();
        }
        return updatedContent.doc_id;
    },

    addInvite: async function addInvite(body) {
        let db = await getDb(colName);

        const document = await db.collection.findOne({ _id: new ObjectId(`${body.docId}`) });
        const invited = document.invited;
        invited.push(body.recipient);

        const filter = { _id: new ObjectId(`${body.docId}`) };
        const updatedDocument = {
            ...document,
            invited: invited,
        };

        try {
            return await db.collection.updateOne(filter, { $set: updatedDocument });
        } catch (e) {
            console.error(e);
        } finally {
            await db.client.close();
        }
    },

    acceptInvitation: async function acceptInvitation(details) {
        let db = await getDb(colName);

        const document = await db.collection.findOne({ doc_id: details.docId });

        const user = await auth.getOne(details.email);
        const invited = document.invited;
        const collaborators = document.collaborators;
        invited.pop(details.email);
        collaborators.push(user._id);

        const filter = { _id: new ObjectId(`${document._id}`) };
        const updatedDocument = {
            ...document,
            invited: invited,
            collaborators: collaborators,
        };

        try {
            return await db.collection.updateOne(filter, { $set: updatedDocument });
        } catch (e) {
            console.error(e);
        } finally {
            await db.client.close();
        }
    },

    editOne: async function editOne(body) {
        let db = await getDb(colName);

        const filter = { doc_id: body.doc_id };
        const updatedContent = {
            title: body.title,
            content: body.content,
            updated: new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" }),
        };

        try {
            return await db.collection.updateOne(filter, { $set: updatedContent });
        } catch (e) {
            console.error(e);
        } finally {
            await db.client.close();
        }
    },
    
    commentOne: async function commentOne(body) {
        let db = await getDb(colName);
        const document = await db.collection.findOne({ doc_id: body.doc_id });
        let newComment = {
            id: body.comment_id,
            content: body.content
        }
        const comments = document.comments
        comments.push(newComment)

        const filter = { doc_id: body.doc_id };
        const updatedContent = {
            ...document,
            comments: comments
        };

        try {
            return await db.collection.updateOne(filter, { $set: updatedContent });
        } catch (e) {
            console.error(e);
        } finally {
            await db.client.close();
        }
    },

    deleteOne: async function deleteOne(id) {
        let db = await getDb(colName);

        const filter = { doc_id: id };

        try {
            return await db.collection.deleteOne(filter);
        } catch (e) {
            console.error(e);
        } finally {
            await db.client.close();
        }
    },

    resetDb: async function resetDb() {
        let db = await getDb(colName);

        setupContent = setupContent.map((doc) => ({
            ...doc,
            created: new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" }),
            updated: new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" }),
        }));

        await db.collection.deleteMany();
        await db.collection.insertMany(setupContent);

        const content = await db.collection.find({}).toArray();
        for (const doc in content) {
            const filter = { _id: new ObjectId(`${content[doc]._id}`) };
            const updatedContent = {
                ...content[doc],
                doc_id: filter._id.toString().slice(-6),
            };
            await db.collection.updateOne(filter, { $set: updatedContent });
        }

        await db.client.close();
    },
};

module.exports = docs;
