const { MongoClient: mongo } = require("mongodb");
const colName = "entries";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k5lbc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

async function getDb() {
    let dsn = uri || "mongodb://localhost:27017/docs";

    if (process.env.NODE_ENV === 'test') {
        dsn = "mongodb://localhost:27017/test";
    }

    const client = await mongo.connect(dsn);
    const db = client.db();
    const collection = db.collection(colName);

    return {
        collection: collection,
        client: client,
    };
}

module.exports = getDb;