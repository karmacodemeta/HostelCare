const mongoose = require('mongoose');

// Manually define Schemas to match
const StudentSchema = new mongoose.Schema({ name: String, rent: Number, branchId: mongoose.Schema.Types.ObjectId, hostelId: mongoose.Schema.Types.ObjectId, isActive: Boolean }, { strict: false });
const PaymentSchema = new mongoose.Schema({ studentId: mongoose.Schema.Types.ObjectId, hostelId: mongoose.Schema.Types.ObjectId, branchId: mongoose.Schema.Types.ObjectId, amount: Number, date: Date, type: String, description: String }, { timestamps: true });
const ExpenseSchema = new mongoose.Schema({ category: String, amount: Number, date: Date, description: String, branchId: mongoose.Schema.Types.ObjectId, hostelId: mongoose.Schema.Types.ObjectId }, { timestamps: true });
const ActivityLogSchema = new mongoose.Schema({ action: String, entityType: String, entityId: mongoose.Schema.Types.ObjectId, details: mongoose.Schema.Types.Mixed, performedBy: String, hostelId: mongoose.Schema.Types.ObjectId, timestamp: Date }, { timestamps: true });

const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);

async function run() {
    const uri = 'mongodb://localhost:27017/hostel-care';
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB for Dashboard seeding!');

        // Clear existing payments, expenses, activity logs
        await Payment.deleteMany({});
        await Expense.deleteMany({});
        await ActivityLog.deleteMany({});
        console.log('Cleared existing payments, expenses, and activity logs collections.');

        const hostelId = new mongoose.Types.ObjectId("6a1382bd4a8634ff5495d4cf");
        const branchId = new mongoose.Types.ObjectId("6a13838b4a8634ff5495d554");

        // 1. Fetch the 20 seeded students
        const students = await Student.find({ hostelId, isActive: { $ne: false } }).lean();
        console.log(`Found ${students.length} students to seed payments for.`);

        if (students.length === 0) {
            console.log('Error: No students found in database. Run seeder first!');
            return;
        }

        // 2. Generate premium mock Payments
        const mockPayments = [];
        let totalCollected = 0;

        // Add Advance & Security Deposit for all students
        students.forEach((student, index) => {
            const date = new Date(Date.now() - (15 - (index % 10)) * 24 * 60 * 60 * 1000); // spread across last 15 days
            const advanceAmount = 1500;
            mockPayments.push({
                studentId: student._id,
                hostelId: hostelId,
                branchId: branchId,
                amount: advanceAmount,
                date: date,
                type: 'advance',
                description: 'Initial Advance / Security Deposit'
            });
            totalCollected += advanceAmount;

            // Also let's simulate that 14 of the students also paid their first month's rent successfully
            if (index < 14) {
                const rentAmount = student.rent || 5000;
                mockPayments.push({
                    studentId: student._id,
                    hostelId: hostelId,
                    branchId: branchId,
                    amount: rentAmount,
                    date: date,
                    type: 'rent',
                    description: 'First Month Rent (Admission)'
                });
                totalCollected += rentAmount;
            }
        });

        const paymentDocs = await Payment.insertMany(mockPayments);
        console.log(`Successfully seeded ${paymentDocs.length} payments (Total Collected: ₹${totalCollected})`);

        // 3. Generate mock Expenses
        const mockExpenses = [
            {
                category: 'Utilities',
                amount: 4800,
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                description: 'Electricity Bill - Patna Sadar Branch',
                branchId: branchId,
                hostelId: hostelId
            },
            {
                category: 'Maintenance',
                amount: 3500,
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                description: 'Water motor pump rewinding and plumbing',
                branchId: branchId,
                hostelId: hostelId
            },
            {
                category: 'Food/Mess',
                amount: 9200,
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                description: 'Weekly mess vegetables, ration, and grocery supply',
                branchId: branchId,
                hostelId: hostelId
            },
            {
                category: 'Staff',
                amount: 8000,
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                description: 'Patna warden part-time helper allowance',
                branchId: branchId,
                hostelId: hostelId
            }
        ];

        const expenseDocs = await Expense.insertMany(mockExpenses);
        console.log(`Successfully seeded ${expenseDocs.length} operational expenses!`);

        // 4. Generate premium, correct ActivityLogs (replaces the "Imported 0 students" feed)
        const mockLogs = [
            {
                action: 'BRANCH_CREATED',
                entityType: 'Branch',
                entityId: branchId,
                details: { name: 'patna', address: 'BORING ROAD', managerName: 'HEMA' },
                performedBy: 'Admin',
                hostelId: hostelId,
                timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            },
            {
                action: 'BULK_STUDENT_IMPORT',
                entityType: 'Student',
                details: { count: 20, description: 'Imported 20 resident students from test_bulk_import_csv.csv' },
                performedBy: 'Admin',
                hostelId: hostelId,
                timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
            },
            {
                action: 'EXPENSE_ADDED',
                entityType: 'Expense',
                entityId: expenseDocs[0]._id,
                details: { amount: 4800, category: 'Utilities', description: 'Electricity Bill - Patna Sadar Branch' },
                performedBy: 'Admin',
                hostelId: hostelId,
                timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
            },
            {
                action: 'EXPENSE_ADDED',
                entityType: 'Expense',
                entityId: expenseDocs[1]._id,
                details: { amount: 3500, category: 'Maintenance', description: 'Water motor pump rewinding and plumbing' },
                performedBy: 'Admin',
                hostelId: hostelId,
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            },
            {
                action: 'RENT_COLLECTED',
                entityType: 'Student',
                entityId: students[0]._id,
                details: { amount: 5200, name: students[0].name, type: 'rent' },
                performedBy: 'Admin',
                hostelId: hostelId,
                timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
            },
            {
                action: 'RENT_COLLECTED',
                entityType: 'Student',
                entityId: students[1]._id,
                details: { amount: 5500, name: students[1].name, type: 'rent' },
                performedBy: 'Admin',
                hostelId: hostelId,
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            },
            {
                action: 'EXPENSE_ADDED',
                entityType: 'Expense',
                entityId: expenseDocs[2]._id,
                details: { amount: 9200, category: 'Food/Mess', description: 'Weekly mess vegetables, ration, and grocery supply' },
                performedBy: 'Admin',
                hostelId: hostelId,
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                action: 'EXPENSE_ADDED',
                entityType: 'Expense',
                entityId: expenseDocs[3]._id,
                details: { amount: 8000, category: 'Staff', description: 'Patna warden part-time helper allowance' },
                performedBy: 'Admin',
                hostelId: hostelId,
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
        ];

        const logDocs = await ActivityLog.insertMany(mockLogs);
        console.log(`Successfully seeded ${logDocs.length} premium activity logs!`);

        console.log('\n--- SEEDING COMPLETED ---');
        console.log(`Total Active Students: 20`);
        console.log(`Total Revenue: ₹${totalCollected}`);
        console.log(`Total Outflow Expenses: ₹${mockExpenses.reduce((sum, e) => sum + e.amount, 0)}`);
        console.log(`Net Profit: ₹${totalCollected - mockExpenses.reduce((sum, e) => sum + e.amount, 0)}`);

    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
