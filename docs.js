const { ObjectId } = require("mongodb");
const getDb = require("./db/database.js");

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

    // Fixa allt nedan
    getOne: async function getOne(id) {
        let db = await getDb();
        // console.log(new ObjectId(`${id}`).toString().slice(-6))
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
        let addCreated = new Date().toLocaleString()
        try {
            await db.collection.insertOne({
                title: addTitle,
                content: addContent,
                created: addCreated
            });
            const addDoc = await db.collection.findOne({created: addCreated})
            const filter = { _id: new ObjectId(`${addDoc._id}`) };
            const updatedContent = {
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
    },

    editOne: async function editOne(body) {
        let db = await getDb();

        const filter = { _id: new ObjectId(`${body.id}`) };
        const updatedContent = {
            title: body.title,
            content: body.content,
            updated: new Date().toLocaleString()
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

        const filter = { _id: new ObjectId(`${id}`) };

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

        let setupContent = [
            {
                "title": "Hemligt dokument 1",
                "content": "Det här är ett hemligt dokument som bara vi får läsa."
            },
            {
                "title": "Glass",
                "content": "Glass är gott."
            },
            {
                "title": "Läsken för mig",
                "content": "Champis kanske är favoriten. Men Coca-Cola är också svårslaget."
            },
            {
                "title": "Vinnare av SHL 24-25",
                "content": "Brynäs!"
            }
        ]

        setupContent = setupContent.map(doc => ({
            ...doc,
            created: new Date().toLocaleString()
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