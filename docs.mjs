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

        try {
            return await db.get("SELECT *, rowid AS id FROM documents WHERE rowid=?", id);
        } catch (e) {
            console.error(e);

            return {};
        } finally {
            await db.close();
        }
    },

    addOne: async function addOne(body) {
        let db = await getDb();

        try {
            return await db.run(
                "INSERT INTO documents (title, content) VALUES (?, ?)",
                body.title,
                body.content
            );
        } catch (e) {
            console.error(e);
        } finally {
            await db.close();
        }
    },

    editOne: async function editOne(body) {
        let db = await getDb();

        try {
            return await db.run(
                `UPDATE documents SET title = ?, content = ? WHERE rowid = ${body.id}`,
                body.title,
                body.content
            );
        } catch (e) {
            console.error(e);
        } finally {
            await db.close();
        }
    },
};

export default docs;
