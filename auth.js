const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getDb = require("./db/database.js");

const colName = "users";
const jwtSecret = process.env.JWT_SECRET;
const saltRounds = 10;

const auth = {
    login: async function login(body) {
        let success;
        let reason;
        let jwtToken;
        
        const username = body.email;
        const password = body.password;

        const user = await auth.getOne(username);

        if (user === null) {
            success = false
            reason = "no user"
        } else {
            try {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    const payload = { email: user.email };
                    jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
                    success = true;

                } else {
                    success = false;
                    reason = "wrong password"
                }
            } catch (e) {
                console.error(e);
            }
        }
        return { success, jwtToken, reason };
    },

    validateToken: async function validateToken(headers) {
        let success;
        
        const token = headers['x-access-token'];

        if (!token) {
            success = false
        } else {
            try {
                jwt.verify(token, jwtSecret, function(err, decoded) {
                    if (err) {
                        return err;
                    }
                    success = true;
                    return success;
                });
            } catch (e) {
                console.error(e);
            }
        }
        return success;
    },

    register: async function register(body) {
        let success;
    
        const username = body.email;
        const password = body.password;
        const checkEmail = await auth.getOne(username);
    
        if (checkEmail !== null) {
            success = false
        } else {
            try {
                const hash = await bcrypt.hash(password, saltRounds);
        
                const user = {
                    email: username,
                    password: hash
                };
    
                await auth.addOne(user);
                success = true
                
            } catch (e) {
                console.error(e);
            }
        }
        return success;
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

    getOne: async function getOne(email) {
        let db = await getDb(colName);
        try {
            return await db.collection.findOne({email: email})
        } catch (e) {
            console.error(e);

            return {};
        } finally {
            await db.client.close();
        }
    },

    addOne: async function addOne(user) {
        let db = await getDb(colName);
        try {
            return await db.collection.insertOne(user);
        } catch (e) {
            console.error(e);
        } finally {
            await db.client.close();
        }
    },

    editOne: async function editOne(body) {
        let db = await getDb(colName);

        const user = await auth.getOne(body.email)

        const filter = { _id: new ObjectId(`${user._id}`) };
        const updatedContent = {
            token: body.token
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