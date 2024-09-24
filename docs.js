const { ObjectId } = require("mongodb");
const getDb = require("./db/database.js");

let setupContent = require('./db/setupContent.json');

const docs = {
    getAll: async function getAll() {
        let db = await getDb();

        try {
            return await db.collection.find({}).toArray();
        } catch (e) {
            console.error(e);

                return [];
            } finally {
                await db.client.close();
        }
    },

    getOne: async function getOne(id) {
        let db = await getDb();
        try {
            return await db.collection.findOne({doc_id: id})
        } catch (e) {
            console.error(e);

            return {};
        } finally {
            await db.client.close();
        }
    },

    addOne: async function addOne(addTitle, addContent) {
        let db = await getDb();
        let addCreated = new Date().toLocaleString('sv-SE', {timeZone: 'Europe/Stockholm'})
        let updatedContent;
        try {
            await db.collection.insertOne({
                title: addTitle,
                content: addContent,
                created: addCreated,
                updated: addCreated
            });
            const addDoc = await db.collection.findOne({created: addCreated})
            const filter = { _id: new ObjectId(`${addDoc._id}`) };
            updatedContent = {
                ...addDoc,
                doc_id: filter._id.toString().slice(-6)
            };
            await db.collection.updateOne(
                filter,
                { $set: updatedContent }
            );
        } catch (e) {
            console.error(e);
        } finally {
            await db.client.close();
        }
        return updatedContent.doc_id
    },

    editOne: async function editOne(body) {
        let db = await getDb();

        const filter = { _id: new ObjectId(`${body._id}`) };
        const updatedContent = {
            title: body.title,
            content: body.content,
            updated: new Date().toLocaleString('sv-SE', {timeZone: 'Europe/Stockholm'})
        };

        try {
            return await db.collection.updateOne(
                filter,
                { $set: updatedContent }
            );
        } catch (e) {
            console.error(e);
        } finally {
            await db.client.close();
        }
    },

    deleteOne: async function deleteOne(id) {
        let db = await getDb();

        const filter = { doc_id: id };

        try {
            return await db.collection.deleteOne(
                filter
            );
        } catch (e) {
            console.error(e);
        } finally {
            await db.client.close();
        }
    },

    resetDb: async function resetDb() {
        let db = await getDb();

        setupContent = setupContent.map(doc => ({
            ...doc,
            created: new Date().toLocaleString('sv-SE', {timeZone: 'Europe/Stockholm'}),
            updated: new Date().toLocaleString('sv-SE', {timeZone: 'Europe/Stockholm'})
        }));

        await db.collection.deleteMany();
        await db.collection.insertMany(setupContent);

        const content = await db.collection.find({}).toArray();
        for (const doc in content) {
            const filter = { _id: new ObjectId(`${content[doc]._id}`) };
            const updatedContent = {
                ...content[doc],
                doc_id: filter._id.toString().slice(-6)
            };
            await db.collection.updateOne(
                filter,
                { $set: updatedContent }
            );
        }

        await db.client.close();
    }
};

module.exports = docs;