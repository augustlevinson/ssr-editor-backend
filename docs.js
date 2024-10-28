const { ObjectId } = require("mongodb");
const getDb = require("./db/database.js");
const auth = require("./auth.js");
const colName = "entries";

const docs = {
    // getAll: async function getAll() {
    //     let db = await getDb(colName);

    //     try {
    //         return await db.collection.find({}).toArray();
    //     } catch (e) {
    //         console.error(e);

    //         return [];
    //     } finally {
    //         await db.client.close();
    //     }
    // },

    getAllByUserId: async function getAllByUserId(userId) {
        let db = await getDb(colName);

        try {
            const docs = await db.collection.find({ owner: userId }).toArray();
            return docs
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
            const docs = await db.collection.find({ invited: email }).toArray();
            return docs
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

    addOne: async function addOne(details) {
        let db = await getDb(colName);
        let addCreated = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" });
        let updatedContent;
        try {
            await db.collection.insertOne({
                title: details.title,
                owner: new ObjectId(`${details.owner}`),
                invited: [],
                collaborators: [],
                comments: [],
                content: details.content,
                created: addCreated,
                updated: addCreated,
                type: details.type,
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

        const document = await db.collection.findOne({ doc_id: body.doc_id });
        const invited = document.invited;

        if (invited.includes(body.recipient)) {
            return "already invited"
        } else {
            invited.push(body.recipient);
    
            const filter = { doc_id: body.doc_id };
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
        }

    },

    acceptInvitation: async function acceptInvitation(details) {
        let db = await getDb(colName);
        const document = await db.collection.findOne({ doc_id: details.docId });

        const user = await auth.getOne(details.email);
        const invited = document.invited;
        let collaborators = document.collaborators;

        const updatedInvite = invited.filter((invite) => invite !== details.email);

        collaborators.push(user._id);

        // behövs för att inte få dubletter då objectId
        // inte kan jämföras 'rakt av'.
        collaborators = collaborators
            .map(id => id.toString())
            .filter((id, index, self) => self.indexOf(id) === index)
            .map(id => ObjectId.createFromHexString(id));
        
        const filter = { _id: new ObjectId(`${document._id}`) };
        const updatedDocument = {
            ...document,
            invited: updatedInvite,
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
            content: body.content,
            user: body.user,
            created: new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" }),
        };
        const comments = document.comments;
        comments.push(newComment);

        const filter = { doc_id: body.doc_id };
        const updatedContent = {
            ...document,
            comments: comments,
        };

        try {
            await db.collection.updateOne(filter, { $set: updatedContent });
            return await db.collection.findOne({ doc_id: body.doc_id });
        } catch (e) {
            console.error(e);
        } finally {
            await db.client.close();
        }
    },

    deleteComment: async function deleteComment(body) {
        let db = await getDb(colName);
        const document = await db.collection.findOne({ doc_id: body.doc_id });
        const comments = document.comments;
        const comment_id = body.comment_id;
        let commentedContent = document.content;

        let regex = new RegExp(`<span[^>]*id="comment-${comment_id}"[^>]*>(.*?)<\/span>`, "g");

        // Replacea kommentaren med det som är innanför span-taggarna
        let uncommentedContent = commentedContent.replace(regex, "$1");

        const updatedComments = comments.filter((comment) => comment.id !== comment_id);

        const filter = { doc_id: body.doc_id };
        const updatedContent = {
            ...document,
            content: uncommentedContent,
            comments: updatedComments,
        };

        try {
            await db.collection.updateOne(filter, { $set: updatedContent });
            return await db.collection.findOne({ doc_id: body.doc_id });
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

        await db.collection.deleteMany();

        await db.client.close();
    },
};

module.exports = docs;
