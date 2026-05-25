const mongoose = require('mongoose');

// Connect to DB (update URI if needed, checking .env.local logic ideally)
const MONGODB_URI = 'mongodb://localhost:27017/hostel-care';

async function fixIndexes() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const collection = mongoose.connection.collection('branches');
        const indexes = await collection.indexes();

        console.log('Current Indexes:', indexes);

        const nameIndex = indexes.find(idx => idx.key && idx.key.name === 1 && Object.keys(idx.key).length === 1);

        if (nameIndex) {
            console.log('Dropping old unique index on name...');
            await collection.dropIndex(nameIndex.name);
            console.log('Dropped index:', nameIndex.name);
        } else {
            console.log('No old name index found.');
        }

        console.log('Done. New compound index will be created by Mongoose on next app startup.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

fixIndexes();
