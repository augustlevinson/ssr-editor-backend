import { ObjectId } from "mongodb";
import getDb from "./db/database.mjs";

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
            return await db.collection.findOne({_id: new ObjectId(`${id}`)})
        } catch (e) {
            console.error(e);

            return {};
        } finally {
            await db.client.close();
        }
    },

    addOne: async function addOne(body) {
        let db = await getDb();

        try {
            return await db.collection.insertOne({
                title: body.title,
                content: body.content,
                created: new Date().toLocaleString()
            }
            );
        } catch (e) {
            console.error(e);
        } finally {
            await db.client.close();
        }
    },

    editOne: async function editOne(body) {
        let db = await getDb();
        console.log(body.id)

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
};

export default docs;
