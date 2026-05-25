const mongoose = require('mongoose');

async function run() {
    const uri = 'mongodb://localhost:27017/hostel-care';
    try {
        await mongoose.connect(uri);
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const users = await User.find().lean();
        console.log('All Registered Users:');
        users.forEach(u => {
            console.log(`- Name: ${u.name}, Email: ${u.email}, Password: ${u.password}, Role: ${u.role}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
