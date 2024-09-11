/**
 * Connect to the database and set it up with some default data.
 */
"use strict";

const mongo = require("mongodb").MongoClient;
const dsn =  process.env.DBWEBB_DSN || "mongodb://localhost:27017/docs";

const fs = require("fs");
const path = require("path");
let docs = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, "setup.json"),
    "utf8"
));

// Append "created": new Date() to each object
docs = docs.map(doc => ({
    ...doc,
    created: new Date().toLocaleString()
}));

// Do it.
resetCollection(dsn, "entries", docs)
    .catch(err => console.log(err));



/**
 * Reset a collection by removing existing content and insert a default
 * set of documents.
 *
 * @async
 *
 * @param {string} dsn     DSN to connect to database.
 * @param {string} colName Name of collection.
 * @param {string} doc     Documents to be inserted into collection.
 *
 * @throws Error when database operation fails.
 *
 * @return {Promise<void>} Void
 */
async function resetCollection(dsn, colName, doc) {
    const client  = await mongo.connect(dsn);
    const db = await client.db();
    const col = await db.collection(colName);

    await col.deleteMany();
    await col.insertMany(doc);

    await client.close();
}