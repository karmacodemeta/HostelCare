const mongoose = require('mongoose');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Manually define Student Schema to match
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
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB for seeding!');

        // Delete existing students to have a clean slate
        await Student.deleteMany({});
        console.log('Cleared existing students collection.');

        const filePath = path.join(__dirname, '..', 'test_bulk_import_csv.csv');
        const fileData = fs.readFileSync(filePath);

        const wb = XLSX.read(fileData, { type: 'buffer' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const jsonData = XLSX.utils.sheet_to_json(ws);
        console.log('Parsed JSON count:', jsonData.length);

        const hostelId = new mongoose.Types.ObjectId("6a1382bd4a8634ff5495d4cf");
        const branchId = new mongoose.Types.ObjectId("6a13838b4a8634ff5495d554");

        const parsedStudents = jsonData.map((row) => {
            const newRow = {};
            const keys = Object.keys(row);
            
            if (keys.length === 1 && keys[0].includes(',')) {
                const headerParts = keys[0].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
                const valParts = String(row[keys[0]]).split(',').map(s => s.trim().replace(/^"|"$/g, ''));
                
                headerParts.forEach((header, index) => {
                    const normalizedKey = header.toLowerCase();
                    const val = valParts[index] || '';
                    
                    if (normalizedKey.includes('name')) newRow.name = val;
                    else if (normalizedKey.includes('guardian') || normalizedKey.includes('father')) newRow.guardian = val;
                    else if (normalizedKey.includes('room')) newRow.room = val;
                    else if (normalizedKey.includes('address')) newRow.address = val;
                    else if (normalizedKey.includes('rent')) newRow.rent = val;
                    else if (normalizedKey.includes('due')) newRow.dues = val;
                    else if (normalizedKey.includes('contact') || normalizedKey.includes('phone') || normalizedKey.includes('mobile')) newRow.contactNumber = val;
                });
            }
            
            return {
                name: newRow.name,
                contactNumber: newRow.contactNumber || 'Not Provided',
                guardian: newRow.guardian || 'Unknown',
                roomNo: newRow.room ? String(newRow.room) : 'Unassigned',
                address: newRow.address || 'Unknown',
                rent: Number(newRow.rent || 0),
                dues: Number(newRow.dues || 0),
                branchId: branchId,
                hostelId: hostelId,
                isActive: true
            };
        });

        console.log('Mapped students count:', parsedStudents.length);
        const result = await Student.insertMany(parsedStudents, { ordered: false });
        console.log(`Successfully seeded ${result.length} students into the database!`);

    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
