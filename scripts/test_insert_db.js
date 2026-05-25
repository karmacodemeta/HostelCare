const mongoose = require('mongoose');

// Define Schema manually to match
const StudentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        contactNumber: { type: String, required: true },
        guardian: { type: String, required: true },
        guardianContact: { type: String },
        address: { type: String, required: true },
        roomNo: { type: String, required: true },
        admissionDate: { type: Date, required: true, default: Date.now },
        rent: { type: Number, required: true, default: 0 },
        advanceAmount: { type: Number, required: true, default: 0 },
        dues: { type: Number, required: true, default: 0 },
        isActive: { type: Boolean, default: true },
        branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
    },
    { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);

async function run() {
    const uri = 'mongodb://localhost:27017/hostel-care';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB!');

    const hostelId = new mongoose.Types.ObjectId("6a1382bd4a8634ff5495d4cf");
    const branchId = new mongoose.Types.ObjectId("6a13838b4a8634ff5495d554");

    const sampleStudents = [
        {
            name: 'Amit Kumar',
            contactNumber: 'Not Provided',
            guardian: 'Rajesh Kumar',
            roomNo: '101',
            address: 'Patna Sadar',
            rent: 5000,
            dues: 200,
            branchId: branchId,
            hostelId: hostelId
        },
        {
            name: 'Priya Singh',
            contactNumber: 'Not Provided',
            guardian: 'Sunil Singh',
            roomNo: '102',
            address: 'Kankarbagh',
            rent: 5500,
            dues: 0,
            branchId: branchId,
            hostelId: hostelId
        }
    ];

    try {
        console.log('Inserting sample students...');
        const result = await Student.insertMany(sampleStudents, { ordered: false });
        console.log('Insert Success! Length:', result.length);
        console.log('Result details:', result);
    } catch (err) {
        console.error('Insert Failed Error:', err);
    } finally {
        // Clean up inserted test data
        await Student.deleteMany({ name: { $in: ['Amit Kumar', 'Priya Singh'] } });
        console.log('Cleaned up test students.');
        await mongoose.disconnect();
    }
}

run();
