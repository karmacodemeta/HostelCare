const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define Schemas minimal for seeding
const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String, required: true },
    role: { type: String, default: 'student' },
    hostelId: { type: Schema.Types.ObjectId },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
    await mongoose.connect('mongodb://localhost:27017/hostel-care');

    const email = 'super@hostel.com';
    const password = 'supersecret';

    const existing = await User.findOne({ email });
    if (existing) {
        console.log('Super admin already exists');
        process.exit(0);
    }

    await User.create({
        name: 'Super Admin',
        email,
        password,
        role: 'super_admin'
    });

    console.log('Super admin created: ' + email + ' / ' + password);
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
