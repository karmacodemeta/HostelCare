const { MongoClient } = require('mongodb');

async function run() {
    const url = 'mongodb://localhost:27017';
    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db('hostel-care');
        const indexes = await db.collection('students').indexes();
        console.log('Students collection indexes:', indexes);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
