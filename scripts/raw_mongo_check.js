const { MongoClient } = require('mongodb');

async function run() {
    const url = 'mongodb://localhost:27017';
    const client = new MongoClient(url);

    try {
        await client.connect();
        console.log('Connected to MongoDB directly!');
        const db = client.db('hostel-care');

        const collections = await db.listCollections().toArray();
        console.log('\nCollections:');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} docs`);
            if (count > 0) {
                const sample = await db.collection(col.name).findOne();
                console.log('  Sample doc keys:', Object.keys(sample));
                console.log('  Sample details:', JSON.stringify(sample).slice(0, 300));
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
