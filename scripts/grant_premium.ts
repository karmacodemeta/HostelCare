import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Hostel from '../models/Hostel';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Available env vars:', process.env);
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function grantPremium() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to DB');

        const result = await Hostel.updateMany(
            {},
            { $addToSet: { features: 'student_profile' } } // usage of $addToSet prevents duplicates
        );

        console.log(`Updated ${result.modifiedCount} hostels to have Premium features.`);

    } catch (error) {
        console.error('Error granting premium:', error);
    } finally {
        await mongoose.disconnect();
    }
}

grantPremium();
