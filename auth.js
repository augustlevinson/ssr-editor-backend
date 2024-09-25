const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getDb = require("./db/database.js");

const colName = "users";
const jwtSecret = process.env.JWT_SECRET;
const saltRounds = 10;

const auth = {
    login: async function login(body) {
        let db = await getDb(colName);
        
        const username = body.email;
        const password = body.password;
        const user = await db.collection.findOne({email: username})

        try {
        const result = await bcrypt.compare(password, user.password);
            if (result) {
                const payload = { email: user.email };
                const jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

                return { token: jwtToken}

            } else {
                console.log("Lösenorden matchar inte")
                return false
            }
        } catch (e) {
            console.error(e);
        } finally {
            await db.client.close();
        }
    },

    register: async function register(body) {
        let db;

        const username = body.email;
        const password = body.password;

        bcrypt.hash(password, saltRounds, async function(err, hash) {
            db = await getDb(colName);

            const user = {
                email: username,
                password: hash
            };
    
            try {
                return await db.collection.insertOne(user);
            } catch (e) {
                console.error(e);
            } finally {
                await db.client.close();
            }
        });
    },

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

    getOne: async function getOne(id) {
        let db = await getDb(colName);
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
        let db = await getDb(colName);
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
        let db = await getDb(colName);

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
        let db = await getDb(colName);

        const filter = { user_id: id };

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

    clearDb: async function clearDb() {
        let db = await getDb(colName);
        await db.collection.deleteMany();
        await db.client.close();
    }
};

module.exports = auth;