const mongoose = require('mongoose');

// Connect to DB - Ensure this URI matches your local setup
const MONGODB_URI = 'mongodb://localhost:27017/hostel-care';

async function cleanupCategories() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const Category = mongoose.connection.collection('expensecategories');

        // 1. Remove categories with no hostelId (Legacy/Orphaned)
        // Only do this if you are sure you don't want "Global" categories
        const legacy = await Category.deleteMany({ hostelId: { $exists: false } });
        console.log(`Deleted ${legacy.deletedCount} legacy categories (no hostelId).`);

        // 2. Remove duplicates within the same hostel
        // Get all categories
        const allCats = await Category.find({}).toArray();
        console.log(`Scanning ${allCats.length} categories for duplicates...`);

        const seen = new Set();
        let deletedCount = 0;

        for (const cat of allCats) {
            // Unique key: hostelId + lowercase name
            // Assuming hostelId is an ObjectId, toString() needed
            const hostelId = cat.hostelId ? cat.hostelId.toString() : 'global';
            const key = `${hostelId}|${cat.name.trim().toLowerCase()}`;

            if (seen.has(key)) {
                // Duplicate found! Delete it.
                await Category.deleteOne({ _id: cat._id });
                deletedCount++;
            } else {
                seen.add(key);
            }
        }

        console.log(`Deleted ${deletedCount} duplicate categories.`);

        console.log('Cleanup complete.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

cleanupCategories();
