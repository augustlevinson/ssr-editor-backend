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

    validateToken: async function validateToken(user) {
        let success;

        const token = user.token;

        if (!token) {
            success = false
        } else {
            try {
                jwt.verify(token, jwtSecret, function(err, decoded) {
                    if (err) {
                        console.log(err)
                        success = false;
                        return success;
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

    getOne: async function getOne(email) {
        let db = await getDb(colName);
        try {
            return await db.collection.findOne({email: email})
        } catch (e) {
            console.error(e);
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

    deleteOne: async function deleteOne(id) {
        let db = await getDb(colName);

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

    clearDb: async function clearDb() {
        let db = await getDb(colName);
        await db.collection.deleteMany();
        await db.client.close();
        return "User database is now empty."
    }
};

module.exports = auth;