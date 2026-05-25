const mongoose = require('mongoose');

async function run() {
    try {
        const uri = 'mongodb://localhost:27017/hostel-care';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB successfully!');

        // Models
        const Student = mongoose.model('Student', new mongoose.Schema({}, { strict: false }));
        const Branch = mongoose.model('Branch', new mongoose.Schema({}, { strict: false }));
        const Hostel = mongoose.model('Hostel', new mongoose.Schema({}, { strict: false }));
        const ActivityLog = mongoose.model('ActivityLog', new mongoose.Schema({}, { strict: false }));

        const hostels = await Hostel.find().lean();
        console.log('\nHostels count:', hostels.length);
        hostels.forEach(h => console.log(`- ${h.name} (${h._id})`));

        const branches = await Branch.find().lean();
        console.log('\nBranches count:', branches.length);
        branches.forEach(b => console.log(`- ${b.name} (${b._id}) under hostel ${b.hostelId}`));

        const students = await Student.find().lean();
        console.log('\nStudents count:', students.length);
        students.slice(0, 5).forEach(s => console.log(`- ${s.name} (${s._id}) branch: ${s.branchId} hostel: ${s.hostelId}`));

        const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(10).lean();
        console.log('\nRecent Logs count:', logs.length);
        logs.forEach(l => console.log(`- ${l.action} (${l.entityType}) performed by: ${l.performedBy} on ${l.timestamp}`));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
