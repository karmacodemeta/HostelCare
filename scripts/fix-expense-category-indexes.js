const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixExpenseCategoryIndexes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('expensecategories');

        // List current indexes
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        // Find the old unique index on name
        const nameIndex = indexes.find(idx => idx.key.name === 1 && idx.unique === true && Object.keys(idx.key).length === 1);

        if (nameIndex) {
            console.log(`Dropping old unique index: ${nameIndex.name}`);
            await collection.dropIndex(nameIndex.name);
            console.log('Old index dropped.');
        } else {
            console.log('No old unique index found on "name" only.');
        }

        // Create new compound index
        console.log('Creating new compound index on { name: 1, hostelId: 1 }');
        await collection.createIndex({ name: 1, hostelId: 1 }, { unique: true });
        console.log('New index created successfully.');

        console.log('Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

fixExpenseCategoryIndexes();
