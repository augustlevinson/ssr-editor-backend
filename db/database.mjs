import { MongoClient as mongo } from "mongodb";
const colName = "entries";

async function getDb () {
    let dsn = `mongodb://localhost:27017/docs`;
    
    if (process.env.NODE_ENV === 'test') {
        dsn = "mongodb://localhost:27017/test";
    }
    
    const client  = await mongo.connect(dsn);
    const db = client.db();
    const collection = db.collection(colName);

    return {
        collection: collection,
        client: client,
    };
}

export default getDb;
