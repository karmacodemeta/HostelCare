const mongoose = require('mongoose');
const path = require('path');

// Try to load .env.local, but handle if it fails or if we rely on shell env vars
try {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
} catch (e) {
    console.log('dotenv not found or .env.local missing, relying on process.env');
}

async function checkDb() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('ERROR: MONGODB_URI is not defined in environment.');
        process.exit(1);
    }

    console.log('---------------------------------------------------');
    console.log('Checking Database Connection...');
    // Mask the URI for security in logs, show only protocol and host if possible
    const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
    console.log(`URI: ${maskedUri}`);

    try {
        await mongoose.connect(uri);
        const connection = mongoose.connection;

        console.log('---------------------------------------------------');
        console.log('CONNECTED SUCCESSFULLY');
        console.log(`Database Name: "${connection.name}"`);
        console.log(`Host: ${connection.host}`);
        console.log(`Port: ${connection.port}`);
        console.log('---------------------------------------------------');

        // Check Collections
        const collections = await connection.db.listCollections().toArray();
        console.log('Collections found in this database:');
        if (collections.length === 0) {
            console.log('   (No collections found - DB is empty)');
        } else {
            for (const col of collections) {
                const count = await connection.db.collection(col.name).countDocuments();
                console.log(`   - ${col.name}: ${count} documents`);
            }
        }
        console.log('---------------------------------------------------');

        if (collections.length > 0) {
            console.log('CONCLUSION: The application IS connecting to this database.');
            console.log('If these counts match what you see in the UI, then this is the correct DB.');
            console.log('If the UI shows data but this shows 0, then the UI is likely serving STALE CACHE.');
        } else {
            console.log('CONCLUSION: This database is EMPTY.');
            console.log('If the UI shows data, it is definitely serving STALE CACHE.');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('CONNECTION FAILED:', error.message);
    }
}

checkDb();
