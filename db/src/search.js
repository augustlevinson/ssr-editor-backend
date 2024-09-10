/**
 * Connect to the database and search using a criteria.
 */
"use strict";

const mongo = require("mongodb").MongoClient;
const dsn =  process.env.DBWEBB_DSN || "mongodb://localhost:27017/docs";

// Find documents for this living in...
const criteria1 = {
    title: "Glass"
};
const projection1 = {
    title: 1,
    content: 1,
    _id: 0
};
const limit1 = 3;

// Find documents where title starts with string
const criteria2 = {
    title: /^Sn/
};
const projection2 = {
    _id: 1,
    title: 1
};
const limit2 = 3;



// Do it within an Immediately Invoked Async Arrow Function.
// This is to enable usage of await within the function scope.
(async () => {
    // Find using .then()
    findInCollection(dsn, "entries", criteria1, projection1, limit1)
        .then(res => console.log(res))
        .catch(err => console.log(err));

    // Find using await
    try {
        let res = await findInCollection(
            dsn, "entries", criteria2, projection2, limit2
        );

        console.log(res);
    } catch (err) {
        console.log(err);
    }
})();



/**
 * Find documents in an collection by matching search criteria.
 *
 * @async
 *
 * @param {string} dsn        DSN to connect to database.
 * @param {string} colName    Name of collection.
 * @param {object} criteria   Search criteria.
 * @param {object} projection What to project in results.
 * @param {number} limit      Limit the number of documents to retrieve.
 *
 * @throws Error when database operation fails.
 *
 * @return {Promise<array>} The resultset as an array.
 */
async function findInCollection(dsn, colName, criteria, projection, limit) {
    const client  = await mongo.connect(dsn);
    const db = await client.db();
    const col = await db.collection(colName);
    const res = await col.find(criteria, projection).limit(limit).toArray();

    await client.close();

    return res;
}